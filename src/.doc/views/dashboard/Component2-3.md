# Component2-3实现
主要任务：
1. 添加，删除供应商(渲染+ts请求逻辑)，删除时需要使用弹框确认
2. 添加，删除对应提供商的模型(渲染+ts请求逻辑)，，删除时需要使用弹框确认
渲染样式：浅蓝白色，弹出要有动画效果，两个弹框样式尽量复用

前端代码编写要求参考: `/utils/ref.md`,关于请求，提示信息，弹框请严格参考并遵循，保证网页统一性，样式不乱飞

**prefix**: `/model_group"`, `/model`

## 添加供应商
其中只有提供商的图片不是必须的字段！添加成功后，自动切换并渲染该新增的提供商

**Param**:
group_name: 提供商名称
group_attr: 提供商图片
group_key: 提供商统一的api-key
base_url: 提供商统一url(只支持OpenAI格式)
returning: group_uuid: 提供商分组uuid

```python
@router.post("") # POST "/model_group"
async def create_group(group_name: str, group_attr: Optional[str],
                       group_key: str, base_url: str,
                       service: ModelManageService = Depends(get_model_manage_service)
                       ) -> Result[str]:
    return Result.success(
        data=service.create_group(group_name, group_attr, group_key, base_url)
    )
```

## 删除供应商

group_uuid: 分组uuid
returning: 模型id(前端不需要使用)

```python
@router.delete("") # DELETE "/model_group"
async def delete_group(group_uuid: str,
                       service: ModelManageService = Depends(get_model_manage_service)
                       ) -> Result[int]:
    return Result.success(
        data=service.delete_group(group_uuid)
    )
```

## 添加模型
```python
class ModelCreateParam(BaseModel):
    model_name: Optional[str] = None
    group_uuid: Optional[str] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    type_id: Optional[int] = None

@router.post("") # POST "/model"
async def add_model(request: Request,
                    dto: ModelCreateParam = Body(description="创建模型所需参数体"),
                    service: ModelService = Depends(get_model_service)):
    user_uuid = getattr(request.state.user, "user_id", None)
    return Result.success(
        data=service.add_model(dto, user_uuid)
    )
```
注意，dto中的type_id要在添加模型的弹框中做一个下拉框，用于渲染type_name并选择type_id，下拉框做得跟供应商那部分的下拉框差不多就行
```python
@dataclass
class ModelType:
    id: Optional[int] = None # 新增模型时将这个存Body
    model_type_name: Optional[str] = None # 渲染这个
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "model_type_name": self.model_type_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

@router.get("/all") # GET "/model_type/all"
async def get_all(service: ModelTypeService = Depends(get_model_type_service)
                  ) -> Result[List[ModelType]]:
    return Result.success(
        data=service.select_all_type()
    )

```

## 删除模型
删除模型的触发回调位于`deleteModel`函数中，你只需要在那里传入model_id并完成这个业务
```python
@router.delete("") # DELETE "/model"
async def delete_model(model_id: int = Param(description="模型唯一id"),
                       service: ModelService = Depends(get_model_service)):
    return Result.success(
        data=service.delete_model(model_id)
    )
```