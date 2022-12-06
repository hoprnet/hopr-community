export function randomWord(wordlist) {
    const randomIndex = Math.floor(Math.random() * wordlist.length);

    return wordlist[randomIndex];
}

export function guessLetter(letter, word) {
    let response = [];

    for(let i = 0; i < word.length; i++) {
        const currentChar = word[i];
        if(currentChar == letter)
            response.push(i);
    }

    if(response.length == 0)
        response = false;

    return response;
}
