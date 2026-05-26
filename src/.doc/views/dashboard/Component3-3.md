# Component3渲染
完成文档的添加功能

请求，弹框，提示信息的代码参考`src\utils\ref.md`，为了统一项目，不能乱来

## 接口定义
```python 
@router.post("/upload") # POST /vector-manage/upload
async def upload(req: Request,
                 collection_name: str = Form(description="所要向量化数据所处的集合"),
                 file: Optional[UploadFile] = Form(description="向量化使用的文档，最大10MB"),
                 metadatas: Optional[dict[str, Any]] = Form(default=None, description="切分的文档元数据"),
                 language: str = Form(default='en', description="文档使用的主语言"),
                 service: VectorManageService = Depends(get_vector_manage_service)) -> Result[List[str]]:
    user_id = UserContext.get_user_id(req)
    return Result.success(
        data=await service.upload(user_id, collection_name, metadatas, file, language)
    )
```
要求：复用弹框样式，元数据(metadatas)字段暂时不用管, 从list中获取集合名，打开文件系统供用户选取文件，还有一个让用户选择语言的下拉框即可