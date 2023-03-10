import { values } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import DefaultImage from '../images/DefaultProfile.jpeg'
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, deleteDocData, storage, updateDocData } from '../firebase/firebase';
import { AuthContext } from '../store/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Navigate, useNavigate } from 'react-router-dom';
import useUserQuery from '../reactQuery/userQuery';
import { EmailAuthProvider, reauthenticateWithCredential, User } from 'firebase/auth';
import useRecruitmentQuery from '../reactQuery/RecruitmentQuery';
// import { getStorage, ref, getDownloadURL } from "firebase/storage";


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

  const navigate = useNavigate()

  //auth
  const userInfo = useContext(AuthContext)
  const userId = userInfo?.uid

  //recoil
  // const userData = useRecoilValue(user)
  // const data = userData.find(i => i.id === userId)
  
  //react-query
  const {isLoading:userLoading, data:userData} = useUserQuery()
  const {isLoading:recruitmentLoading, data:recruitmentData} = useRecruitmentQuery()
  const curUser = userData?.map(i => ({...i})).find(i => i.id === userId)

  //useStates
  const [info, setInfo] = useState<InfoType>({
    pic: curUser?.pic as string,
    intro: curUser?.intro as string,
    gender: curUser?.gender as string,
    bday: curUser?.bday ? curUser?.bday as string : `${new Date().getFullYear()-19}-${(new Date().getMonth()+1).toString().padStart(2,'0')}-${new Date().getDate().toString().padStart(2,'0')}`,
    interest: curUser?.interest as [],
    team: curUser?.team as [],
    experience: curUser?.experience as [],
    heart: curUser?.heart as [],
    apply: curUser?.apply as []
  })
  const [experience, setExperience] = useState('')
  const [percent, setPercent] = useState<number | null>(null)
  const [file, setFile] = useState<File>()

  //?????? ??????
  const [pwd, setPwd] = useState('')
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(
    user?.email as string, pwd
  )
  const onChangeHandler = (e:React.ChangeEvent<HTMLInputElement>) => {
    setPwd(e.target.value)
  } 
  const handleSignOut = async() => {
    if (user != null) {
      await deleteDocData('userInfo', userId as string)
      .then(() => {
        recruitmentData?.map((post) => {
          if(post.writer === userId) {
            deleteDocData('recruitment', post.id)
          }
        })
      })
      .then(() => {
        recruitmentData?.map(async(post) => {
          if(post.applicant.includes(userId as string)) {
            let applicantArr = post.applicant.filter(i => i !== userId)
            await updateDocData('recruitment', post.id, {applicant: applicantArr})
          }
          if(post.confirmed.includes(userId as string)) {
            let confirmedArr = post.confirmed.filter(i => i !== userId)
            await updateDocData('recruitment', post.id, {confirmed: confirmedArr})
          }
        })
      })
      .then(() => {
        user?.delete().then(() => {
          alert('????????? ?????????????????????.')
          navigate('/login')
        })
      })
      .catch((error) => {
        console.error(error)
      })
    }
  }

  const checkOldPwd = () => {
    reauthenticateWithCredential(user as User, credential)
      .then(result => {
        console.log(result)
        confirm('????????? ???????????? ????????? ???????????????. ?????? ?????????????????????????')
        && handleSignOut()
      }).then(() => {

      })
      .catch((e) => {
        console.log(e)
        alert('????????? ?????????????????????.')
      })
  }
  

  //upload picture file
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
  
  // setInfo
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
      // const result = await getUserData();
      // setData(result)
      // console.log(result)
    } catch(e) {
      console.log(e)
    }
  }

  // media-query
  const isDefault: boolean = useMediaQuery({
    query: "(min-width:768px)",
  });

  return (<>
    <h2 className='mt-10 text-2xl font-bold'>????????? ??????</h2>
    <form onSubmit={(e) => {
      e.preventDefault();
      confirm('????????? ????????? ?????????????????????????') &&
      confirmHandler()
    }}
      className='w-full flex flex-col mt-5'>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>????????? ??????</label>
      <div className={`flex items-end w-full max-w-[500px] h-44`}>
        <img src={info.pic} alt='My picture' className='w-40 h-40 shrink-0 object-cover mr-5 border border-[#9ec08c] rounded-[100%]'/>
        <input onChange={(e) => setFile(((e.target as HTMLInputElement).files as FileList)[0])}
          type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" 
          className='block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100'/>
      </div>
      <label htmlFor='info' className='text-black mt-10 mb-2 text-lg font-semibold'>????????????</label>
      <textarea className={`w-full max-w-[500px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black`}
        onChange={(e) => setInfo({...info, intro:e.target.value})}
        id='info' name='info' rows={2}
        placeholder='????????? ????????? ??????????????????'
        value={info.intro}
        ></textarea>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>??????</label>
      <div className='flex justify-between w-28'>
        <div className='flex items-center'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.gender==='??????'}
            type='radio' id='male' name='gender' value='??????' className='mr-1'/>
          <label htmlFor='male'>??????</label>
        </div>
        <div className='flex items-center'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.gender==='??????'}
            type='radio' id='female' name='gender' value='??????' className='mr-1'/>
          <label htmlFor='female'>??????</label>
        </div>
      </div>
      <label htmlFor='bday' className='text-black mt-10 mb-2 text-lg font-semibold'>????????????</label>
      <input className='w-52 text-black py-2 px-4 bg-gray-100 border rounded-md border-black'
        onChange={(e) => setInfo({...info, bday:e.target.value})}
        type='date' id='bday' value={info.bday}/>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>?????? ??????</label>
      <div className='flex items-center justify-between w-full max-w-[500px] h-10'>
        <div className='flex items-center input'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={(info.interest as string[])?.includes('??????')}
            type='checkbox' id='movie' value='??????' name='interest' className='mr-1'/>
          <label htmlFor='movie'>??????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={(info.interest as string[])?.includes('?????????')}
            type='checkbox' id='drama' value='?????????' name='interest' className='mr-1'/>
          <label htmlFor='drama'>?????????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('??????')}
            type='checkbox' id='adv' value='??????' name='interest' className='mr-1'/>
          <label htmlFor='adv'>??????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('???????????????')}
            type='checkbox' id='music' value='???????????????' name='interest' className='mr-1'/>
          <label htmlFor='music'>???????????????</label>
        </div>
      </div>
      <div className='flex items-center justify-between w-full max-w-[500px] h-10'>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('??????')}
            type='checkbox' id='broad' value='??????' name='interest' className='mr-1'/>
          <label htmlFor='broad'>??????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('????????????')}
            type='checkbox' id='web' value='????????????' name='interest' className='mr-1'/>
          <label htmlFor='web'>????????????</label>
        </div>
        <div className='flex items-center input'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('?????????')}
            type='checkbox' id='yt' value='?????????' name='interest' className='mr-1'/>
          <label htmlFor='yt'>?????????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.interest?.includes('??????')}
            type='checkbox' id='interestEtc' value='??????' name='interest' className='mr-1'/>
          <label htmlFor='etc'>??????</label>
        </div>
      </div>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>?????? ??????</label>
      <div className='flex items-center justify-between w-full max-w-[400px] h-10'>
        <div className='flex items-center input'>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('?????????')}
            type='checkbox' id='directing' value='?????????' name='team' className='mr-1'/>
          <label htmlFor='directing'>?????????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('?????????')}
            type='checkbox' id='art' value='?????????' name='team' className='mr-1'/>
          <label htmlFor='art'>?????????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('?????????')}
            type='checkbox' id='light' value='?????????' name='team' className='mr-1'/>
          <label htmlFor='light'>?????????</label>
        </div>
      </div>
      <div className='flex items-center justify-between w-full max-w-[400px] h-10'>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('?????????')}
            type='checkbox' id='dress' value='?????????' name='team' className='mr-1'/>
          <label htmlFor='dress'>?????????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('????????????')}
            type='checkbox' id='subAct' value='????????????' name='team' className='mr-1'/>
          <label htmlFor='subAct'>????????????</label>
        </div>
        <div className='flex items-center '>
          <input onChange={(e) => {
            onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
            checked={info.team?.includes('??????')}
            type='checkbox' id='teamEtc' value='??????' name='team' className='mr-1'/>
          <label htmlFor='etc'>??????</label>
        </div>
      </div>
      <label className='text-black mt-10 mb-2 text-lg font-semibold'>????????????</label>
        <ul className="marker:text-sky-400 list-disc pl-5 space-y-3 text-slate-500 ">
          {info.experience?.map((text, index) => (
          <div key={index} className='flex justify-between w-full max-w-[430px]'>
            <li className='w-full max-w-[370px]'>{text}</li>
            <button onClick={(e) => {
              e.preventDefault();
              setInfo({...info, experience:info.experience.filter((_,i) => i !== index)})
              }}
              className='underline px-2'>X</button>
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
            placeholder='22??? 10??? 00???????????? 00?????????????????? ????????? ??????' type="text" value={experience} />
          <button onClick={(e) => {
            e.preventDefault();
            setExperience('')
            setInfo({...info, experience:[...info.experience, experience]})
          }}
            className='btn btn--green border h-10 w-16 ml-2 p-1'>??????</button>
        </div>
      <input 
        disabled={percent !== null && percent! < 100}
        type='submit' className='btn btn--reverse border border-black mt-10 w-full max-w-[500px] disabled:bg-zinc-500' value='??????????????? ?????? ??????' />
    </form>
    <div className='w-full max-w-[750px] border border-transparent border-b-gray-400 mt-20'></div>
    <h2 className='mt-16 text-2xl font-bold'>?????? ??????</h2>
    <div className='flex w-full mt-6'>
      <input className={`${isDefault ? 'w-[70%]' : 'w-full'} max-w-[400px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black outline-none focus:outline-none`}
        placeholder='??????????????? ??????????????????'
        type='password' onChange={onChangeHandler} value={pwd} />
      <button className='btn border border-black ml-5 text-sm'
        onClick={checkOldPwd}>?????? ??????</button>
    </div>
  </>
  )
}
