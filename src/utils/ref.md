# Utils about this project

## how to request

source file `@utils/http.ts`.

**Import**

```ts
import { httpInstance, type Response } from "@/utils/http";
```

**Use**

```ts
try {
  const res = await httpInstance.post<any, Response>("/auth/login", form.value);
  if (res.code !== 200) {
    loginErrorMessage.value = res.message;
    return;
  }
  localStorage.setItem("token", res.data.access_token);
  router.push({ name: "dashboard" });
} catch (error) {
  alert(`系统错误:${error}`);
}
```

## how to use the tips

source file `@utils/toast/Toast.ts`.

**Import**

```ts
import Toast from '@/utils/toast/Toast.vue';
```

**Then**
Html:`<Toast ref="toastRef" :message="msg" :type="type" :duration="1500" />`

**Use**
```ts
// tips initalize
const toastRef = ref()
const msg = ref('')
const type = ref<'success' | 'error'>('success')

// how to use
const openSettings = async () => {
  try {
    const res = await httpInstance.get<any, Response>("/user/setting")
    if (res.code !== 200) {
      // set value before 
      type.value = 'error'
      msg.value = `${res.message}!` 
      toastRef.value.show()
    } else {
      userSetting.value = res.data
    }
  } catch (error) {
    type.value = 'error'
    msg.value = `意外错误:${error}!`
    toastRef.value.show()
  }
  showSettings.value = true
}
```

## how to use the dialog

source file `@utils/dialog/Dialog.vue`.

**Import**

```ts
import Dialog from '@/utils/dialog/Dialog.vue';
```

**Then**
Html: `<Dialog v-model:visible="visible" title="标题" content="内容" @confirm="onConfirm" @cancel="onCancel" />`

**Use**

```ts
// dialog state
const dialogVisible = ref(false)

// open dialog
const openDialog = () => {
  dialogVisible.value = true
}

// confirm callback
const onConfirm = () => {
  console.log('用户点击了确定');
  dialogVisible.value = false
}

// cancel callback
const onCancel = () => {
  dialogVisible.value = false
}
```