# Component1用量统计实现

文件路径: `src\views\dashboard\components\Component1.vue`
需求：实现token每周用量的柱状图，这个组件暂时只需要统计当月的token用量(这个组件暂时不能下滑，整个组件内共四个柱状图，只有一个需要渲染，你合理分配下大小)。
柱状图内容：X -> 一个月的日期，前往后递增(只用渲染这个月第一天和最后一天，一个最前，一个最后)， Y -> token消耗(包括提示，补全，和总消耗)

后端逻辑等utils功能参考：`src\utils\ref.md`

## 柱状图渲染

样式参考: `src\.doc\style-standard.md`文件
每条柱子分两部分，底部为input消耗，上部为output消耗，其中这两个地方颜色不同，底部深色，顶部浅色(都以蓝色为基础)，注意不显示token数
当鼠标hover到对应柱子时，右侧显示card渲染当天的token消耗数据

card渲染：从上往下依次是时间，输入，输出，总计的token，其中输入和输出前面放一个颜色块(对应上方柱子的上下部颜色)
整体效果借鉴deepseek开放平台的制作

如：
|
|
|  
|  
|___________________，中间渲染token消耗的柱子
6.1                 6.30 

## 后端接口

```python
class TokensUsageCountParam(BaseModel):
    date: datetime = Field(description="对应的日期，按天算")
    prompt_tokens_consume: int = Field(default=0, description="提示词token总消耗")
    completion_tokens_consume: int = Field(default=0, description="补全token总消耗")
    total_tokens_consume: int = Field(default=0, description="token总消耗")

@router.get("") # GET "/tokens_usage"
def get_month_consume(dao: TokensUsageRepository = Depends(get_tokens_usage_repository)) -> Result[List[TokensUsageCountParam]]:
    return Result.success(
        data=dao.get_month_token_consume() # 获取当月内每日的token消耗
    )
```

响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "date": "2026-06-08T00:00:00",
      "prompt_tokens_consume": 89,
      "completion_tokens_consume": 112,
      "total_tokens_consume": 201
    },
    {
      "date": "2026-06-07T00:00:00",
      "prompt_tokens_consume": 2454,
      "completion_tokens_consume": 1512,
      "total_tokens_consume": 3966
    },
    {
      "date": "2026-06-06T00:00:00",
      "prompt_tokens_consume": 358,
      "completion_tokens_consume": 245,
      "total_tokens_consume": 603
    },
    {
      "date": "2026-06-03T00:00:00",
      "prompt_tokens_consume": 1464,
      "completion_tokens_consume": 0,
      "total_tokens_consume": 1464
    }
  ],
  "time": "2026-06-10T14:32:33.840393",
  "request": ""
}
```
