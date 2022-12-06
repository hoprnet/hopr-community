function jumpingHangman() {
    return(
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 700 700" width="400" height="400" version="1.0">
        <g transform="translate(350 350)">
        <!--body-->
        <path d="M0, -100 L0 0 L-30 75 M0 0 L30 75" fill="none" stroke="red" stroke-width="3" >
        <animate dur="1s" repeatCount="indefinite" attributeName="d" values="M0, -100 L0 0 L-30 75 M0 0 L30 75; M0,-150 L0 -50 L-10 30 M0 -50 L10 30; M0,-175 L0 -75 L-10 10 M0 -75 L10 10; M0, -100 L0 0 L-30 75 M0 0 L30 75">
        </animate>
        </path>
        <!--        arms-->
        <path d="M40 -25 L0 -50 L-40 -25" fill="none" stroke="red" stroke-width="3" >
        <animate dur="1s" repeatCount="indefinite" attributeName="d" values="M40 -25 L0 -50 L-40 -25; M40 -125 L0 -100 L-40 -125; M40 -150 L0 -115 L-40 -150; M40 -25 L0 -50 L-40 -25"></animate>
        </path>
        <!--      head-->
        <circle cx="0" cy="-130" r="30" stroke="red" stroke-width="3" fill="none" >
        <animate dur="1s" repeatCount="indefinite" attributeName="cy" values="-130; -180; -205;  -130"></animate>
        </circle>
        <path d="M-100 50 Q0 110 100 50 " fill="none" stroke="red" stroke-width="3" >
        <animate dur="1s" repeatCount="indefinite" attributeName="d" values="M-100 50 Q0 110 100 50; M-100 50 Q0 30 100 50; M-100 50 Q0 50 100 50; M-100 50 Q0 50 100 50; M-100 50 Q0 110 100 50"></animate>

        </path>

        </g>
        </svg>
    )
}

export default jumpingHangman
