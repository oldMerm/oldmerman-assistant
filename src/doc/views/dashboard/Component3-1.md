# 知识库管理组件
知识库管理主要就是集合的管理，根据下方的提示词完成`src\views\dashboard\components\Component3.vue`的编辑

要求：
1.参考`src\views\dashboard\components\Component2.vue`中的布局，还有弹框如添加集合等操作内容的弹框也要参考其中的样式
2.请求，弹框，提示信息的代码参考`src\utils\ref.md`，为了统一项目，不能乱来

## 知识库渲染

1.上方topbar渲染出知识库管理这几个字，这个字右边渲染一些数据，比如集合总数xxx，你先留着位置用假数据渲染，然后右边渲染按钮`添加集合` 2.中间是一个能滑动(如果集合数量很多，虽然大概率达不到，但你还是防御下)对集合的渲染，这里你就参考component2中的model分类渲染就行了
3。一个知识库渲染的块大小类似其中一个分类的大小，然后鼠标hover到每个集合所属的块，块右上角就出现x，点击删除触发弹框确认，
成功或者失败你都弹出提示信息，每个集合块还需要包含添加文档和撤销文档按钮，在右下方渲染，中部渲染下面的集合信息。
其中知识库的每个集合需要渲染这几条内容(其中的id不要渲染)

```python
class VectorCollection:
    id: Optional[int] = None
    embedding_id: Optional[int] = None # 向量模型id，可以为null
    collection_name: Optional[str] = None # 集合名称
    collection_alias: Optional[str] = None # 集合别名
    collection_description: Optional[str] = None # 集合描述
    items_number: Optional[int] = None # 集合中文档条数
    created_at: datetime = field(default_factory=datetime.now) # 创建时间
```

添加和撤销文档的逻辑你先不用做，点击就alert一个“功能未开放”。

你需要完成的请求功能如下：

## 请求逻辑

一共有两个接口需要完成，
1.get_render_collection(渲染集合信息)，切换到这个component3组件你就发起渲染的请求，对集合进行渲染
2.insert_collection(创建新的集合)，对应topbar右边的添加集合按钮触发的渲染逻辑(记住弹框样式要参考compnent2，做到项目统一)

代码：
```python
router = APIRouter(prefix="/vector_manage", tags=["vector"])

@dataclass
class VectorCollection:
    id: Optional[int] = None
    embedding_id: Optional[int] = None
    collection_name: Optional[str] = None
    collection_alias: Optional[str] = None
    collection_description: Optional[str] = None
    items_number: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)

class VectorCollectionUpdateParam(BaseModel):
    embedding_id: Optional[int] = None
    collection_name: Optional[str] = None
    collection_alias: Optional[str] = None
    collection_description: Optional[str] = None
    items_number: Optional[int] = None

@router.get("/render") # GET /vector_manage/render
def get_render_collection(service: VectorManageService = Depends(get_vector_manage_service)
                                ) -> Result[List[VectorCollection]]:
    return Result.success(
        data=service.get_render_list()
    )

@router.post("") # POST /vector_manage/render
def insert_collection(dto: VectorCollectionUpdateParam = Body(description="集合更新需要的param"),
                            service: VectorManageService = Depends(get_vector_manage_service)
                            ) -> Result[int]:
    return Result.success(
        data=service.insert_collection(dto)
    )

```
