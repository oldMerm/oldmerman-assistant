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
  alert(`Error:${error}`);
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
    msg.value = `Error:${error}!`
    toastRef.value.show()
  }
  showSettings.value = true
}
```