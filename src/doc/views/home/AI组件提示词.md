# AI对话组件
核心功能：AI对话弹框，包括AI聊天(暂不保存历史会话)，切换模型，切换知识库等功能

**位置**：在`home`目录下新建/components/ChatCard组件(然后在`src\views\home\index.vue`的页面点击"开始对话"弹出)
**参考**：
请求，弹框，提示信息的代码参考`src\utils\ref.md`(如果需要)
样式参考`src\.doc\style-standard.md`

## 弹框样式
* 浅蓝白色调(不要任何紫色)，弹框弹出需要有动画效果
* 弹框弹出位置位于视口最右侧，贴着，宽度大约为视口宽度的1/3，高度约为视口高度的一半，垂直居中并紧贴右边
* 弹框上方依次是模型切换按钮，刷新(清空会话)和叉叉(尽量使用图标，点击模型按钮触发下拉框请求，点击刷新时有旋转的动画特效最好，叉叉也加个旋转的动画，两个都hover到变蓝色并旋转，原色可以用浅灰)
* 弹框中心大背景用于存放用户的提示词与AI的响应内容，背景里可以有一句标语，叫`老鱼人知识库`，要占到组件的大部分位置
* 底部为用户提示词输入框，然后输入框(输入框内默认浅色字`向老鱼人知识库提问...\n暂不支持记忆功能`)右边是一个发送箭头(箭头颜色比背景深一点即可，不要做出臃肿的按钮，然后要做透明色，给用户一种这个按钮在输入框内部的感觉)

## 业务逻辑
### 模型切换
下拉框渲染已注册的模型列表，hover到item变色，可以点击对应的item切换使用的模型(存一个变量值，请求后端时携带模型的id即可)
每个item渲染：左边渲染模型名称，右边渲染模型所属type_name，请合理控制间距，点击其它位置关闭

后端接口：
```python 

class ModelRenderParam(BaseModel):
    model_id: Optional[int] = None
    model_name: Optional[str] = None
    type_id: Optional[int] = None
    type_name: Optional[str] = None

@router.get("/render") # GET /model/render
def get_render_model(group_uuid: str = Param(description="模型所属分组uuid"),
                           service: ModelService = Depends(get_model_service)) -> Result[List[ModelRenderParam]]:
    return Result.success(
        data=service.get_group_models(group_uuid)
    )

```

### 对话功能
核心功能，处理流式SSE响应，渲染响应的Markdown
需求：前端保存上下文信息，请求时只发送新的提示词，不做记忆，但渲染的表格中还是能看到上下文(刷新前)

后端接口：
```python

class OChatRequest(BaseModel):
    user_prompt: str = Field(description="请求的内容")
    collection_name: str = Field(description="选择的知识库名称")
    sign: str = Field(description="请求标识，随机的六位字符串")


@router.post("")
async def chat(dto: OChatRequest, req: Request):
    user_prompt = dto.user_prompt
    collection_name = dto.collection_name
    client_ip = req.client.host  # 记录调用者ip地址
    if user_prompt is None or collection_name is None:
        return None

    logger.info(f"用户: {client_ip} 请求， prompt: {user_prompt}")
    factory = AgentsFactory()
    param = factory.build_agent(AgentType.COMMON)
    documents = ChromaVectorHelper(collection_name=collection_name).query(client_ip, [user_prompt]).get("documents")
    # 重排序，根据系统配置判断，若不开启则会原样返回
    ranked_document = rerank(user_prompt, ListSeparator.convert_str_list(documents), client_ip)

    # 构建系统提示词
    system_msg = f"{COMMON_PROMPT}, Use this context:\n{ranked_document}"
    # sign生成于前端(前端可重新生成使线程id过期)，后端拼接时间戳实现自动过期(1h)
    thread_id = f"{client_ip}-{dto.sign}-{datetime.datetime.now().strftime('%Y%m%d%H')}"

    async def generate_response():
        async for chunk in param.agent.astream(
                {"messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_prompt}
                ]},
                {"configurable": {"thread_id": thread_id}},
                context=CommonContext(user_id=client_ip, model_id=param.model_id, model_name=param.model_name),
                version="v2",
                stream_mode="messages"
        ):
            if chunk["type"] == "messages":
                token, metadata = chunk["data"]
                node_type = metadata.get('langgraph_node')
                if node_type == 'model':
                    token_text = getattr(token, 'content', '') or getattr(token, 'text', '')
                    if token_text:
                        yield f"data: {json.dumps({'chunk': token_text, 'type': 'content'})}\n\n"
                elif node_type == 'tool':
                    pass

        yield f"data: {json.dumps({'chunk': 'Finished', 'type': 'end'})}\n\n"

    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )

```

### 刷新功能
后端暂时不存历史会话，点击右上角刷新按钮，直接清理掉响应列表中的提示词和响应数据(即本轮对话的上下文渲染内容)。
不需要保存任何状态，也没有后端请求，用户清空后访问或者重新访问网页请求ai生成时，逻辑和上方是一样的。

**综上流程**: 用户输入提示词 -> 后端生成，前端渲染，上下文加入前端暂存 -> 用户再次输入(只发送这次的输入，上下文不要发送) -> 后端生成，前端加入上下文(用户可以上翻查看之前的对话和响应，只是请求不携带 -> 刷新 -> 清空上下文列表，等待用户新的输入)

后续会慢慢支持记忆功能，你现在先不用管，除了前端在一轮会话保存和渲染上下文之外，就做单次的对话响应即可。
