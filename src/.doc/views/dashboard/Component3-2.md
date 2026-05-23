# Component3渲染
完成集合渲染块的修改，增加embedding的选择

请求，弹框，提示信息的代码参考`src\utils\ref.md`，为了统一项目，不能乱来

## 逻辑与接口
Task1: 在增加集合处，增加embedding模型的选择，并加入请求体请求后端

请求代码：
```python
# 实体类
class ModelRenderParam1(BaseModel):
    model_id: Optional[int] = None # 添加模型时这个是embedding_id
    model_name: Optional[str] = None

class ModelsWithTypeParam(BaseModel):
    type_id: Optional[int] = None
    type_name: Optional[str] = None
    models: List[ModelRenderParam1] = None

@router.get("/vector-models") # 请求路径: GET /model_type/vector-models param = '向量模型'
def select_all_vector_model(type_name: Optional[str] = Param(description="要查询的模型名称"),
                            service: ModelTypeService = Depends(get_model_type_service)
                            ) -> Result[ModelsWithTypeParam]:
    return Result.success(
        data=service.select_all_vector_model(type_name)
    )

```
获取实体后，就可以渲染向量模型了，在添加集合处
做一个选择下拉框，点击时发送上面请求获取结果，然后渲染模型名称，不用渲染id，但是数据你还是要保留的
当用户选择了对应的模型后，将其对应的embedding_id存到实体并随请求体到后端请求更新，其它不变，就多了这个获取embedding，新增携带embedding的流程