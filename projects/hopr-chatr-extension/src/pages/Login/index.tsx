import styles from "./style.module.scss";

const Login = (props: any) => {
  const handleError = () => {
    const formE = document.getElementById("form");
    const errorE = document.getElementById("error");
    const messageE = document.getElementById("message");
    const iconE = document.getElementById("icon");
    const copyE = document.getElementById("copy");

    if (errorE && formE && copyE && messageE && iconE) {
      formE.style.top = "30px";
      errorE.style.opacity = "100";
      errorE.style.height = "80px";
      copyE.style.marginTop = "0";

      setTimeout(() => {
        messageE.style.opacity = "100";
        iconE.style.opacity = "100";
      }, 300);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form} id="form">
        <img src="/images/logo.svg" alt="Logo" className={styles.logo} />
        <div className={styles.item}>
          <div className={styles.icon}>
            <img src="/images/user.svg" alt="User" />
          </div>
          <input type="text" placeholder="Endpoint" />
        </div>
        <div className={styles.item}>
          <div className={styles.icon}>
            <img src="/images/password.svg" alt="Password" />
          </div>
          <input type="password" placeholder="Password" />
        </div>
        <div className={styles.login}>
          <span className={styles.forgotPass}>Forgot my password</span>
          <div className={styles.button} onClick={() => props.setPage("main")}>
            Login
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.top} onClick={() => handleError()}>
            <span>
              Don't have a account? <span>Sign up</span>
            </span>
            <div className={styles.error} id="error">
              <div className={styles.icon} id="icon">
                <img src="/images/error.svg" alt="Password" />
              </div>
              <div className={styles.message} id="message">
                The email or password you entered doesn't match our records.
                Please double-check and try again
              </div>
            </div>
          </div>
          <div className={styles.copy} id="copy">
            <span>By</span>
            <img src="/images/metamath.svg" alt="MetaMath" />
          </div>
        </div>
      </div>
      <div
        className={styles.lines}
        style={{
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/lines.svg')`,
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100%",
        }}
      ></div>
    </div>
  );
};

export default Login;
