import { faker } from '@faker-js/faker';

export function fakeHoprAddress() {
    return "16Uiu2HAm" + faker.random.alphaNumeric(44);
}

// is not a pure function. Sets multiplayerInstance.gameID
export function makeMessage(data, multiplayerInstance) {
    let game_id = faker.datatype.uuid();

    if(multiplayerInstance) {
        if(multiplayerInstance.gameID)
            game_id = multiplayerInstance.gameID;
        else
            multiplayerInstance.gameID = game_id;
    }

    const wsMsg = {peerId:fakeHoprAddress(),app:'hangman',game_id, score:7};

    return {
        ...wsMsg,
        ...data
    }
}
