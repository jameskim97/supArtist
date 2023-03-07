import { values } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import DefaultImage from '../images/DefaultProfile.jpeg'
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from '../firebase/firebase';
import { AuthContext } from '../store/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { getUserData, user } from '../recoil/user';
import { Navigate } from 'react-router-dom';


interface InfoType {
    pic: any,
    intro: string,
    gender: string,
    bday: string,
    interest: string[],
    team: string[],
    experience: string[]
    heart: string[],
    apply: string[]
}

export default function UserProfileInfoEdit() {

  const userInfo = useContext(AuthContext)
  const userId = userInfo?.uid
  const userData = useRecoilValue(user)
  const data = userData.find(i => i.id === userId)
  const setData = useSetRecoilState(user)
  const [info, setInfo] = useState<InfoType>({
    pic: data?.pic,
    intro: data?.intro as string,
    gender: data?.gender as string,
    bday: data?.bday ? data?.bday as string : `${new Date().getFullYear()-19}-${(new Date().getMonth()+1).toString().padStart(2,'0')}-${new Date().getDate().toString().padStart(2,'0')}`,
    interest: data?.interest as [],
    team: data?.team as [],
    experience: data?.experience as [],
    heart: data?.heart as [],
    apply: data?.apply as []
  })
  const [experience, setExperience] = useState('')
  const [percent, setPercent] = useState<number | null>(null)
  const [file, setFile] = useState<File>()

  useEffect(() => {
    const uploadFile = () => {
      const name = Date.now() + file!.name
      const storageRef = ref(storage, name)
      const uploadTask = uploadBytesResumable(storageRef, file as Blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          setPercent(progress)
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setInfo({...info, pic:downloadURL})
          });
        }
      );

    }
    file && uploadFile();
  },[file])
  
  // const saveImgFile = (e:React.ChangeEvent<HTMLInputElement>) => {
  //   const file = ((e.target as HTMLInputElement).files as FileList)[0]
    // const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   reader.onloadend = () => {
    //     setInfo({...info, pic:reader.result});
    //   };
  // };

  const onCheckedItem = (checked:boolean, name:string, value:string) => {
    if(checked) {
      if(name==='gender') setInfo({...info, gender: value})
      if(name==='interest') setInfo({...info, interest: [...info.interest, value]})
      if(name==='team') setInfo({...info, team: [...info.team, value]})
    } else {
      if(name==='interest') setInfo({ ...info, interest: info.interest.filter(i => i !== value)})
      if(name==='team') setInfo({ ...info, team: info.team.filter(i => i !== value)})
    }
  }
  const confirmHandler = async() => {
    try {
      const docInfo = doc(db, 'userInfo', String(userId))
      await updateDoc(docInfo, {...info})
      const result = await getUserData();
      setData(result)
      console.log(result)
    } catch(e) {
      console.log(e)
    }
  }

  return (<>
    <h2 className='mt-10 text-2xl font-bold'>프로필 정보</h2>
    <form onSubmit={(e) => {
      e.preventDefault();
      confirm('프로필 정보를 수정하시겠습니까?') &&
      confirmHandler()
    }}
      className='w-full flex flex-col mt-5'>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>프로필 사진</label>
      <div className={`flex items-end w-full max-w-[500px] h-44`}>
        <img src={info.pic ? info.pic : DefaultImage} alt='My picture' className='w-40 h-40 shrink-0 object-cover mr-5 border border-[#9ec08c] rounded-[100%]'/>
        <input onChange={(e) => setFile(((e.target as HTMLInputElement).files as FileList)[0])}
          type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" 
          className='block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100'/>
      </div>
      <label htmlFor='info' className='text-black mt-10 mb-2 text-lg font-semibold'>자기소개</label>
      <textarea className={`w-full max-w-[500px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black`}
        onChange={(e) => setInfo({...info, intro:e.target.value})}
        id='info' name='info' rows={2}
        placeholder='간단히 자신을 소개해보세요'
        value={info.intro}
        ></textarea>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>성별</label>
      <div className='flex justify-between w-28'>
        <div className='flex items-center'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.gender==='남성'}
            type='radio' id='male' name='gender' value='남성' className='mr-1'/>
          <label htmlFor='male'>남성</label>
        </div>
        <div className='flex items-center'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.gender==='여성'}
            type='radio' id='female' name='gender' value='여성' className='mr-1'/>
          <label htmlFor='female'>여성</label>
        </div>
      </div>
      <label htmlFor='bday' className='text-black mt-10 mb-2 text-lg font-semibold'>생년월일</label>
      <input className='w-52 text-black py-2 px-4 bg-gray-100 border rounded-md border-black'
        onChange={(e) => setInfo({...info, bday:e.target.value})}
        type='date' id='bday' value={info.bday}/>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>관심 분야</label>
      <div className='flex items-center justify-between w-full max-w-[500px] h-10'>
        <div className='flex items-center input'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={(info.interest as string[])?.includes('영화')}
            type='checkbox' id='movie' value='영화' name='interest' className='mr-1'/>
          <label htmlFor='movie'>영화</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={(info.interest as string[])?.includes('드라마')}
            type='checkbox' id='drama' value='드라마' name='interest' className='mr-1'/>
          <label htmlFor='drama'>드라마</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('광고')}
            type='checkbox' id='adv' value='광고' name='interest' className='mr-1'/>
          <label htmlFor='adv'>광고</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('뮤직비디오')}
            type='checkbox' id='music' value='뮤직비디오' name='interest' className='mr-1'/>
          <label htmlFor='music'>뮤직비디오</label>
        </div>
      </div>
      <div className='flex items-center justify-between w-full max-w-[500px] h-10'>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('방송')}
            type='checkbox' id='broad' value='방송' name='interest' className='mr-1'/>
          <label htmlFor='broad'>방송</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('웹드라마')}
            type='checkbox' id='web' value='웹드라마' name='interest' className='mr-1'/>
          <label htmlFor='web'>웹드라마</label>
        </div>
        <div className='flex items-center input'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('유튜브')}
            type='checkbox' id='yt' value='유튜브' name='interest' className='mr-1'/>
          <label htmlFor='yt'>유튜브</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('기타')}
            type='checkbox' id='interestEtc' value='기타' name='interest' className='mr-1'/>
          <label htmlFor='etc'>기타</label>
        </div>
      </div>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>지원 파트</label>
      <div className='flex items-center justify-between w-full max-w-[400px] h-10'>
        <div className='flex items-center input'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('연출팀')}
            type='checkbox' id='directing' value='연출팀' name='team' className='mr-1'/>
          <label htmlFor='directing'>연출팀</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('아트팀')}
            type='checkbox' id='art' value='아트팀' name='team' className='mr-1'/>
          <label htmlFor='art'>아트팀</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('조명팀')}
            type='checkbox' id='light' value='조명팀' name='team' className='mr-1'/>
          <label htmlFor='light'>조명팀</label>
        </div>
      </div>
      <div className='flex items-center justify-between w-full max-w-[400px] h-10'>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('의상팀')}
            type='checkbox' id='dress' value='의상팀' name='team' className='mr-1'/>
          <label htmlFor='dress'>의상팀</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('보조출연')}
            type='checkbox' id='subAct' value='보조출연' name='team' className='mr-1'/>
          <label htmlFor='subAct'>보조출연</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('기타')}
            type='checkbox' id='teamEtc' value='기타' name='team' className='mr-1'/>
          <label htmlFor='etc'>기타</label>
        </div>
      </div>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>경력사항</label>
        <ul className="marker:text-sky-400 list-disc pl-5 space-y-3 text-slate-500 ">
        {info.experience?.map((text, index) => (
          <div key={index} className='flex justify-between w-full max-w-[430px]'>
            <li className='w-full max-w-[370px]'>{text}</li>
            <button onClick={(e) => {
              e.preventDefault();
              setInfo({...info, experience:info.experience.filter((_,i) => i !== index)})
              }}
              className='underline px-2'>삭제</button>
          </div>
        ))}
        </ul>
        <div className='w-full max-w-[520px] h-20 flex items-center justify-between'>
          <input className="placeholder:italic placeholder:text-slate-400 bg-zinc-100 w-full max-w-[500px] border border-slate-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" 
            onChange={(e) => setExperience(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if(e.key==="Enter") {
                e.preventDefault();
                setInfo({...info, experience:[...info.experience, experience]})
                setExperience('')
              }
            }}
            placeholder='22년 10월 00프로덕션 00가전제품광고 연출팀 참여' type="text" value={experience} />
          <button onClick={(e) => {
            e.preventDefault();
            setExperience('')
            setInfo({...info, experience:[...info.experience, experience]})
          }}
            className='btn btn--green h-10 w-16 ml-2 p-1'>추가</button>
        </div>
      <input 
        disabled={percent !== null && percent! < 100}
        type='submit' className='btn btn--reverse border border-black mt-10 w-full max-w-[500px] disabled:bg-zinc-500' value='프로필정보 수정 완료' />
    </form>
  </>
  )
}
