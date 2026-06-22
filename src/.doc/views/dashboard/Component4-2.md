# Component4优化
修改优化文件`src\views\dashboard\components\Component4.vue`
Task：
1. 优化card样式，然后优化下card内容的渲染布局(这里不需要改逻辑，主要是样式)
2. 添加按`collection_name`过滤的功能，并预留后面一部分位置(水平方向)等未来开发(如果有新的过滤条件)

后端逻辑等utils功能参考：`src\utils\ref.md`

## Task1
具体优化：
1. 改用`浅蓝`配色的card
2. 给下一个过滤功能的渲染预留位置，为此需要缩小card大小，还是渲染**两行**，但是改成**五列**
3. 动画效果不用改，card内的布局可以优化，但需要渲染的参数不变

## Task2
在card上方，topbar下方渲染
请求还是走page，唯一需要的就是添加collection_name到请求(可选)
过滤功能的按钮是一个下拉框，点击时渲染所有**集合名称**，点击对应名称的就把这个collection_name加入请求并请求后端。

为此，后端提供了一个渲染所有集合的接口:
```python

@router.get("/list") # GET /vector-manage/list 
def get_collections(service: VectorManageService = Depends(get_vector_manage_service)
                    ) -> Result[List[str]]: 
    return Result.success(
        data=service.get_collections() # response: the list of collection_name
    )

```

