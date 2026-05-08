import router from "@/router"

const getHome = () => {
    router.push({name:"home"});
}

export {getHome};