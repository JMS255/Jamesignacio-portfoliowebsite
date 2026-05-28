export default function MessengerFloat() {
  return (
    <div className="messenger-float">
      <span className="messenger-float__tip">Message me on Messenger</span>
      <a
        href="https://m.me/craftifylePH"
        className="messenger-float__btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on Messenger"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.145 2 11.25c0 2.852 1.383 5.398 3.563 7.11V22l3.26-1.79A10.6 10.6 0 0 0 12 20.5c5.523 0 10-4.145 10-9.25S17.523 2 12 2Z" fill="white"/>
          <path d="m6.5 14 2.72-2.892 2.615 2.892 2.857-2.892L17 14l-5.115-5.5L6.5 14Z" fill="url(#msng)"/>
          <defs>
            <linearGradient id="msng" x1="6.5" y1="8.5" x2="17" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C6FF"/>
              <stop offset="1" stopColor="#0068FF"/>
            </linearGradient>
          </defs>
        </svg>
      </a>
    </div>
  )
}
