import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import Avatar from '../components/avatar'
import ChatList from '../components/rooms'
import Conversation from '../components/conversation'
import Login from '../components/login'
import useConversations from '../libs/useConversation'
import useLocalStorage from '../libs/useLocalStorage'
import useWebsocket from '../libs/useWebsocket'


export default function Home() {
  const [room, setSelectedRoom] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showLogIn, setShowLogIn] = useState(false);
  const [auth, setAuthUser] = useLocalStorage("user", false);
  const [isLoading, messages, setMessages, fetchConversations] = useConversations("");
  
  // Updates the state to display the typing indicator
  const handleTyping = (mode) => {
    if (mode === "IN") {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
  }

  // Handles incoming and outgoing messages to the state
  const handleMessage = (msg, userId) => {
    setMessages(prev => {
      const item = { content: msg, user_id: userId };
      return [...prev, item];
    })
  }

  // Handles messages retrieved from the WebSocket server
  const onMessage = (data) => {
    try {
      let messageData = JSON.parse(data);
      switch (messageData.chat_type) {
        case "TYPING": {
          handleTyping(messageData.value[0]);
          return;
        }
        case "TEXT": {
          handleMessage(messageData.value[0], messageData.user_id);
          return;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  const sendMessage = useWebsocket(onMessage)

  // Tells the WebSocket server if the current user is still typing a message
  const updateFocus = () => {
    const data = {
      id: 0,
      chat_type: "TYPING",
      value: ["IN"],
      room_id: room.id,
      user_id: auth.id
    }
    sendMessage(JSON.stringify(data))
  }

  // Lets the WebSocket server know when the current user is finished typing
  const onFocusChange = () => {
    const data = {
      id: 0,
      chat_type: "TYPING",
      value: ["OUT"],
      room_id: room.id,
      user_id: auth.id
    }
    sendMessage(JSON.stringify(data))
  }

  //  Updates the message state and then sends the message to the server when a user hits the send button

  const submitMessage = (e) => {
    e.preventDefault();
    let message = e.target.message.value;
    if (message === "") {
      return;
    }
    if (!room.id) {
      alert("Please select chat room!")
      return
    }
    const data = {
      id: 0,
      chat_type: "TEXT",
      value: [message],
      room_id: room.id,
      user_id: auth.id
    }
    sendMessage(JSON.stringify(data))
    e.target.message.value = "";
    handleMessage(message, auth.id);
    onFocusChange();
  }

  // Fetches the conversation of the given room id when a user switches chat rooms
  const updateMessages = (data) => {
    if (!data.id) return;
    fetchConversations(data.id)
    setSelectedRoom(data)
  }

  // Updates the state to signout and removes the user data from local storage
  const signOut = () => {
    window.localStorage.removeItem("user");
    setAuthUser(false);
  }
  useEffect(() => setShowLogIn(!auth), [auth])

  return (
    <div>
      <Head>
        <title>Rust with react chat app</title>
        <meta name="description" content="Rust with react chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Login show={showLogIn} setAuth={setAuthUser} />
      <div className={`${!auth && 'hidden'} bg-gradient-to-b from-orange-400 to-rose-400 h-screen p-12`}>
        <main className='flex w-full max-w-[1020px] h-[700px] mx-auto bg-[#FAF9FE] rounded-[25px] backdrop-opacity-30 opacity-95'>
          <aside className='bg-[#F0EEF5] w-[325px] h-[700px] rounded-l-[25px] p-4 overflow-auto relative'>
            <ChatList onChatChange={updateMessages} userId={auth.id} />
            <button onClick={signOut} className='text-xs w-full max-w-[295px] p-3 rounded-[10px] bg-violet-200 font-semibold text-violet-600 text-center absolute bottom-4'>LOG OUT</button>
          </aside>
          {room?.id && (<section className='rounded-r-[25px] w-full max-w-[690px] grid grid-rows-[80px_minmax(450px,_1fr)_65px]'>
            <div className='rounded-tr-[25px] w-ful'>
              <div className='flex gap-3 p-3 items-center'>
                <Avatar color='rgb(245 158 11)'>{room.users.get_target_user(auth.id)}</Avatar>
                <div>
                  <p className='font-semibold text-gray-600 text-base'>{room.users.get_target_user(auth.id)}</p>
                  <div className='text-xs text-gray-400'>{isTyping ? "Typing..." : "10:15 AM"}</div>
                </div>
              </div>
              <hr className='bg-[#F0EEF5]' />
            </div>
            {(isLoading && room.id) && <p className="px-4 text-slate-500">Loading conversation...</p>}
            <Conversation data={messages} auth={auth} users={room.users} />
            <div className='w-full'>
              <form onSubmit={submitMessage} className='flex gap-2 items-center rounded-full border border-violet-500 bg-violet-200 p-1 m-2'>
                <input
                  onBlur={onFocusChange}
                  onFocus={updateFocus}
                  name="message"
                  className='p-2 placeholder-gray-600 text-sm w-full rounded-full bg-violet-200 focus:outline-none'
                  placeholder='Type your message here...' />
                <button type='submit' className='bg-violet-500 rounded-full py-2 px-6 font-semibold text-white text-sm'>Sent</button>
              </form>
            </div>
          </section>)}
        </main>
      </div>
    </div>
  )
  // End of Home Function
}



// const inter = Inter({ subsets: ['latin'] })


// export default function Home() {
//   return (
//     <>
//       <Head>
//         <title>Create Next App</title>
//         <meta name="description" content="Generated by create next app" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <main className={styles.main}>
//         <div className={styles.description}>
//           <p>
//             Get started by editing&nbsp;
//             <code className={styles.code}>pages/index.js</code>
//           </p>
//           <div>
//             <a
//               href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               By{' '}
//               <Image
//                 src="/vercel.svg"
//                 alt="Vercel Logo"
//                 className={styles.vercelLogo}
//                 width={100}
//                 height={24}
//                 priority
//               />
//             </a>
//           </div>
//         </div>

//         <div className={styles.center}>
//           <Image
//             className={styles.logo}
//             src="/next.svg"
//             alt="Next.js Logo"
//             width={180}
//             height={37}
//             priority
//           />
//           <div className={styles.thirteen}>
//             <Image
//               src="/thirteen.svg"
//               alt="13"
//               width={40}
//               height={31}
//               priority
//             />
//           </div>
//         </div>

//         <div className={styles.grid}>
//           <a
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className={styles.card}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <h2 className={inter.className}>
//               Docs <span>-&gt;</span>
//             </h2>
//             <p className={inter.className}>
//               Find in-depth information about Next.js features and&nbsp;API.
//             </p>
//           </a>

//           <a
//             href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className={styles.card}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <h2 className={inter.className}>
//               Learn <span>-&gt;</span>
//             </h2>
//             <p className={inter.className}>
//               Learn about Next.js in an interactive course with&nbsp;quizzes!
//             </p>
//           </a>

//           <a
//             href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className={styles.card}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <h2 className={inter.className}>
//               Templates <span>-&gt;</span>
//             </h2>
//             <p className={inter.className}>
//               Discover and deploy boilerplate example Next.js&nbsp;projects.
//             </p>
//           </a>

//           <a
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className={styles.card}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <h2 className={inter.className}>
//               Deploy <span>-&gt;</span>
//             </h2>
//             <p className={inter.className}>
//               Instantly deploy your Next.js site to a shareable URL
//               with&nbsp;Vercel.
//             </p>
//           </a>
//         </div>
//       </main>
//     </>
//   )
// }
