import React, { useState } from 'react'
import homeVideo from '../images/filmVideo.mp4'
import cover from '../images/videoCover.png'
import { BsCaretDownFill } from 'react-icons/bs'
import logo from '../images/MainLogo.png'


export default function HomeVisual() {

  // const [menu, setMenu] = useState(false)

  return (
    <div className={`w-full h-[910px] top-0 transition-all overflow-hidden flex items-end bg-white relative`}>
      <video muted autoPlay loop className="w-full h-screen object-cover absolute">
        <source src={homeVideo} type="video/mp4" />
      </video>
      <img src={cover} className='w-full h-[860px] mb-[55px] bg-[#41523c] opacity-40' />
      {/* <button onClick={() => setMenu(!menu)}
        className='absolute top-0 bg-black w-full h-[67px] flex items-center justify-center btn'>
        <span className='text-white text-3xl top-100'>Menu</span>
        <BsCaretDownFill className={`text-white text-4xl top-100 ${menu ? 'rotate-180' : ''}`} />
      </button> */}
      <div className='absolute top-[15%] left-[10%] mr-[5%] flex flex-col'>
        <h1 style={{textShadow: '1px 1px 2px gray'}} 
          className='text-shadow text-6xl text-white font-bold my-8 border-none'>
          영상 스태프는 <br /> Sup-Artist
        </h1>
        {/* <img src={logo} alt='main-logo' className='ml-16' /> */}
        <div style={{textShadow: '1px 1px 2px gray'}} 
          className='text-ow text-3xl leading-relaxed my-3 text-white font-normal'>
          당신이 선택한 작품의 제작과정을 함께하며, <br />
          그 현장의 열정을 직접 경험해보세요!
        </div>
        <button className='btn btn--white border-white text-2xl w-[250px] mt-5'>스태프 지원하러 가기</button>
      </div>
    </div>
  )
}
