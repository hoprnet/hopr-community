import "../styles/all.js";

const hoprAddress = 'ablca';

function Home() {
  return (
    <div className="App">
      <p>Home page</p>
      <p>Hopr Hangman</p>
      <p>Your Hopr Address: { hoprAddress }</p>
      <button class='button'>Play Alone</button>
      <button class='button'>Play with other players</button>

      <div>
        <label class='input-group__label'>Player Hopr Address: <input type='text' placeholder='PeerID' /></label>
      </div>
    </div>
  );
}

export default Home;
