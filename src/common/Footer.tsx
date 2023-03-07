import React, { useContext } from 'react'
import { BsFacebook, BsInstagram, BsYoutube, BsTwitter } from 'react-icons/bs'
import { Default, Mobile } from '../mediaQuery'
import { BsCardChecklist, BsFillPersonFill } from 'react-icons/bs'
import { AiFillHome } from 'react-icons/ai'
import { HiFilm } from 'react-icons/hi'
import Logo from '../images/Logo.png'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../store/AuthContext'

export default function Footer() {

  const navigate = useNavigate()
  const userInfo = useContext(AuthContext)
  const userId = userInfo?.uid

  return (<>
    <hr />
    <Default>
    <div className='relative z-10 flex flex-col justify-center items-center w-full h-72 bg-[#333333]'>
      <div>
        <span className='text-[#669900] font-bold text-sm after:content-["·"] after:mx-2'>이용약관</span>
        <span className='text-[#CCCCCC] font-bold text-sm after:content-["·"] after:mx-2'>개인정보처리방침</span>
        <span className='text-[#CCCCCC] font-bold text-sm after:content-["·"] after:mx-2'>위치기반서비스 이용약관</span>
        <span className='text-[#CCCCCC] font-bold text-sm'>이용자보호 비전과 계획</span>
      </div>
      <div className='mt-3'>
        <span className='text-[#999999] font-bold text-sm mr-1'>대표</span><span className='text-[#777777] font-medium text-sm mr-1 after:content-["|"] after:mx-2'>김동성</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>사업자번호</span><span className='text-[#777777] font-medium text-sm mr-1 after:content-["|"] after:mx-2'>000-00-00000</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>주소</span><span className='text-[#777777] font-medium text-sm mr-1 after:content-["|"] after:mx-2'>서울특별시 00동</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>전화</span><span className='text-[#777777] font-medium text-sm mr-1'>02-0000-0000</span>
      </div>
      <div>
      </div>
      <div className='mt-6 text-[#777777] flex w-48 justify-around'>
        <BsFacebook className='text-2xl' />
        <BsInstagram className='text-2xl'/>
        <BsTwitter className='text-2xl'/>
        <BsYoutube className='text-2xl'/>
      </div>
      <div className='mt-3'>
        <span className='text-[#999999] font-bold text-sm mr-1 after:content-["·"] after:mx-2'>Made by</span>
        <span className='text-[#999999] font-bold text-sm mr-1 after:content-["·"] after:mx-2'>Kody</span>
        <span className='text-[#999999] font-bold text-sm mr-1 after:content-["·"] after:mx-2'>ZeroBase</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>Front-end School</span>
      </div>
      <div className='mt-3 text-[#666666] font-bold text-sm mr-1'>{`© ${(new Date).getFullYear()} Sup-Artist Company. All Rights Reserved.`}</div>
    </div>
    </Default>
    <Mobile><>
    <div className='relative z-10 flex flex-col justify-center items-center w-full h-72 mb-20 bg-[#333333]'>
      <div>
        <span className='text-[#669900] font-bold text-sm after:content-["·"] after:mx-2'>이용약관</span>
        <span className='text-[#CCCCCC] font-bold text-sm'>개인정보처리방침</span>
      </div>
      <div>
        <span className='text-[#CCCCCC] font-bold text-sm after:content-["·"] after:mx-2'>위치기반서비스 이용약관</span>
        <span className='text-[#CCCCCC] font-bold text-sm'>이용자보호 비전과 계획</span>
      </div>
      <div className='mt-3'>
        <span className='text-[#999999] font-bold text-sm mr-1'>대표</span><span className='text-[#777777] font-medium text-sm mr-1 after:content-["|"] after:mx-2'>김동성</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>사업자번호</span><span className='text-[#777777] font-medium text-sm mr-1'>000-00-00000</span>
      </div>
      <div>
        <span className='text-[#999999] font-bold text-sm mr-1'>주소</span><span className='text-[#777777] font-medium text-sm mr-1 after:content-["|"] after:mx-2'>서울특별시 00동</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>전화</span><span className='text-[#777777] font-medium text-sm mr-1'>02-0000-0000</span>
      </div>
      <div className='mt-6 text-[#777777] flex w-48 justify-around'>
        <BsFacebook className='text-2xl' />
        <BsInstagram className='text-2xl'/>
        <BsTwitter className='text-2xl'/>
        <BsYoutube className='text-2xl'/>
      </div>
      <div className='mt-3'>
        <span className='text-[#999999] font-bold text-sm mr-1 after:content-["·"] after:mx-2'>Made by</span>
        <span className='text-[#999999] font-bold text-sm mr-1 after:content-["·"] after:mx-2'>Kody</span>
        <span className='text-[#999999] font-bold text-sm mr-1 after:content-["·"] after:mx-2'>ZeroBase</span>
        <span className='text-[#999999] font-bold text-sm mr-1'>Front-end School</span>
      </div>
      <div className='mt-3 text-[#666666] font-bold text-sm mr-1'>{`© ${(new Date).getFullYear()} Sup-Artist Company. All Rights Reserved.`}</div>
    </div>
    <div className='z-50 fixed bottom-0 w-full '>
      <div className='flex justify-between items-center w-full h-20 bg-[#f6f5f0] flex-1'>
        <button onClick={() => navigate('/')}
          className='flex flex-col w-full justify-start items-center bg-[#f6f5f0] text-[#2c2a29] focus:bg-[#2c2a29] focus:text-[#619004] hover:bg-[#2c2a29] hover:text-[#619004] h-full w-1/4 transition'>
          <AiFillHome className='text-2xl mt-3'/>
          <span>홈</span>
        </button>
        <button onClick={() => navigate('/recruitment')}
          className='flex flex-col w-full justify-start items-center bg-[#f6f5f0] text-[#2c2a29] focus:bg-[#2c2a29] focus:text-[#619004] hover:bg-[#2c2a29] hover:text-[#619004] h-full w-1/4 transition'>
          <BsCardChecklist className='text-2xl mt-3'/>
          <span>모집공고</span>  
        </button>
        <button onClick={() => navigate(`/${userId}`)}
          className='flex flex-col w-full justify-start items-center bg-[#f6f5f0] text-[#2c2a29] focus:bg-[#2c2a29] focus:text-[#619004] hover:bg-[#2c2a29] hover:text-[#619004] h-full w-1/4 transition'>
          <BsFillPersonFill className='text-2xl mt-3'/>
          <span>프로필</span>
        </button>
      </div>
    </div>
    </></Mobile>
  </>
  )
}
