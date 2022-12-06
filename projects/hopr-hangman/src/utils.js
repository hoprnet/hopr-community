export function isValidPeerId(addr) {
    addr = addr.trim();

    let response = true;
    if(addr == "")
        response = false;
    if(!/^16[\d\w]*$/.test(addr))
        response = false;
    if(addr.length < 50)
        response = false;

    return response;

}
