# Component3渲染
文件位置: `src\views\dashboard\components\Component4.vue`
新增重排序模型渲染，开启/关闭选项，和文档管理大标题位于同一水平方向，但是靠右边
样式和组件内样式保持一致

后端逻辑等utils功能参考：`src\utils\ref.md`

## 重排序逻辑
右上角新增button(文档重排序\n model_name或未开启)，上下居中排列，下方字小一点

页面加载：请求rerank状态，若已经开启则获取模型名称渲染，没开启则渲染"未开启"
若已关闭，点击按钮渲染模型列表 -> 选择对应的Rerank模型 -> 弹出再次确认框(项目统一的组件框) -> 请求后端开启重排序
若已开启，点击弹出弹框向用户确认是否关闭文档重排序 -> 用户确认则向后端请求修改，若否则关闭弹框

涉及接口共三个，页面刷新时请求rerank当前状态，渲染rerank列表，更新rerank状态(开启或关闭)
后端代码：
```python
""" GET /system_config/rerank 该接口响应的字典参考，若未开启重排序，将不会有模型相关的参数
{
    "rerank.enabled": True,
    "model_id": model_id,
    "model": model_param.model_name,
    "base_url": model_param.base_url,
    "api_key": model_param.api_key,
} 
"""
@router.get("/rerank", response_model=Result) # GET /system_config/rerank
def get_rerank_config(
        service: SystemConfigService = Depends(get_system_config_service)
) -> Result[dict]:
    return Result.success(
        data=service.get_rerank_config()
    )

# type_name传 '重排序模型'
@router.get("/vector-models") # GET /model_type/vector-models
def select_type_models(type_name: Optional[str] = Param(description="要查询的模型名称"),
                       service: ModelTypeService = Depends(get_model_type_service)
                       ) -> Result[ModelsWithTypeParam]:
    return Result.success(
        data=service.select_type_models(type_name)
    )

class ModelRenderParam1(BaseModel):
    model_id: Optional[int] = None
    model_name: Optional[str] = None
    model_group_name: Optional[str] = None

class ModelsWithTypeParam(BaseModel):
    type_id: Optional[int] = None
    type_name: Optional[str] = None
    models: List[ModelRenderParam1] = None

@router.post("/rerank", response_model=Result) # POST /system_config/rerank
def set_rerank_config(
        req: Request,
        model_id: Optional[int], is_enabled: bool = False,
        service: SystemConfigService = Depends(get_system_config_service)
):
       user_id = UserContext.get_user_id(req)
       service.set_rerank(user_id, model_id, is_enabled)
       return Result.success()

```