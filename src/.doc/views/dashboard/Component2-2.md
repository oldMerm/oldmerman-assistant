# Component2-1.md的接续

目前Component2已经完成了基础的渲染，你需重新理解里面的骨架和ts逻辑，并结合实现下方的需求

## Task1

实现component2中的初始渲染
具体：切换到该组件时，或切换模型分组时触发渲染，渲染的是分组的相关信息，和其分组下的所有模型简单信息

**后端接口与实体**

```python
# 以下为分组相关信息的渲染
# query
@router.get("")
async def get_model_group(group_uuid: Optional[str] = None,
                          service: ModelManageService = Depends(get_model_manage_service)
                          ) -> Result[ModelsGroup]:
    return Result.success(
        data=service.get_model_group(group_uuid)
    )

# 实体
@dataclass
class ModelsGroup:
    id: Optional[int] = None
    group_uuid: str = field(default_factory=lambda: str(uuid.uuid4()))
    group_name: Optional[str] = None
    group_attr: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    api_key: Optional[str] = None
    base_url: Optional[str] = None

# 以下为分组下模型的相关接口
# query
@router.get("/render")
async def get_render_model(group_uuid: str,
                           service: ModelService = Depends(get_model_service)) -> Result[List[ModelRenderParam]]:
    return Result.success(
        data=service.get_group_models(group_uuid)
    )

# 实体
class ModelRenderParam(BaseModel):
    model_id: Optional[int] = None # 模型id
    model_name: Optional[str] = None # 模型名称(根据文件的内容，一个分类只渲染了此字段)
    type_id: Optional[int] = None # 分类id
    type_name: Optional[str] = None # 分类名字
```
注意：该接口返回的是一个模型的数组，其分组并未实现，需要你通过分类id先进行分类，再渲染分类名称和其下的所有模型

## Task2

实现component2中的点击dropdown相关函数交互逻辑
具体：点击下拉框，就请求后端"/model_group/render"，获取所有模型的分组和图片(注意这里只渲染下拉框)
关于请求：请求返回的图片若为None，则按代码逻辑渲染首字符大写

**后端接口与实体**

```python
router = APIRouter(prefix="/model_group", tags=["model_group"])

# query
@router.get("render")
async def get_all_group(service: ModelManageService = Depends(get_model_manage_service)
                        ) -> Result[List[ModelsGroupRender]]:
    return Result.success(
        data=service.get_render_group()
    )

# 实体
class ModelsGroupRender(BaseModel):
    group_uuid: str
    group_name: Optional[str] = None
    group_attr: Optional[str] = None
```
