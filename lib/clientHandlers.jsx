export const logOutHandler = async ()=>{
    // localStorage.removeItem('token')
    // localStorage.removeItem('user')
    // window.location.href = '/login'

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Log Outted")
    return 0
}