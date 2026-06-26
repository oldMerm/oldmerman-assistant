# Component4文档管理实现

样式配色参考: `src\.doc\style-standard.md`
使用vue + ts，要求弹框等需要有动画效果

后端逻辑等utils功能参考：`src\utils\ref.md`

## 渲染参考Compnent3的知识库管理

顶部：文档管理 (渲染文档总条数)
中部(区别)：使用分页渲染一个个card，card的排版你自己来，渲染实体中关键的信息即可
底部：参照Component3

## 后端接口

组件主要实现文档渲染和文档删除的逻辑(其它不需要)

```python
class Page(BaseModel, Generic[T]):
    current: int = Field(default=1,description="当前页码")
    size: int = Field(default=10,description="每页条数")
    total: int = Field(default=0, description="总条数")
    page_num: int = Field(default=0, description="总页数")
    data: Optional[T]

@router.get("") GET /document
def get_documents(current: int = 1, size: int = 10,
                  service: DocumentManageService = Depends(get_document_manage_service)
                  ) -> Result[Page]:
    return Result.success(
        data=service.page(current, size)
    )


@router.delete("") DELETE /document
def delete_document(doc_id: str,
                    service: DocumentManageService = Depends(get_document_manage_service)):
    return Result.success(
        data=service.delete_document(doc_id)
    )

```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "current": 1,
    "size": 10,
    "total": 5,
    "page_num": 1,
    "data": [
      {
        "id": "19b2c350-d87f-4fb3-8078-4603a96abd21",
        "filename": "鱼人博客花了多少钱？？？.md",
        "filesize": 1091,
        "collection_name": "text_collection",
        "updated_at": "2026-05-26T20:49:36.839550+08:00",
        "doc_num": 2
      },
      {
        "id": "0e6a4c00-4da2-4e82-a165-1a474013f6a5",
        "filename": "歌曲分享-01.md",
        "filesize": 3832,
        "collection_name": "text_collection",
        "updated_at": "2026-06-03T13:27:02.259814+08:00",
        "doc_num": 4
      },
      {
        "id": "c0b088d3-c20b-4df2-8dcb-8f9e602cca13",
        "filename": "须知.md",
        "filesize": 1427,
        "collection_name": "text_collection",
        "updated_at": "2026-05-27T13:40:48.031812+08:00",
        "doc_num": 2
      },
      {
        "id": "62c5c041-80cc-4b5e-bafb-fb5ea325d3a4",
        "filename": "agent模块之记忆系统.md",
        "filesize": 16549,
        "collection_name": "text_collection",
        "updated_at": "2026-05-27T13:38:01.508126+08:00",
        "doc_num": 35
      },
      {
        "id": "b70204e8-cdbf-498e-8a2d-2532dcf437cd",
        "filename": "灰沙随水至 青田依水生.md",
        "filesize": 2694,
        "collection_name": "text_collection",
        "updated_at": "2026-06-03T14:08:18.991242+08:00",
        "doc_num": 2
      }
    ]
  },
  "time": "2026-06-10T18:41:29.812256",
  "request": ""
}
```
