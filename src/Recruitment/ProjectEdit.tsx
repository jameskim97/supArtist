import { values } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import DefaultImage from '../images/DefaultProfile.jpeg'
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, storage, updateDocData } from '../firebase/firebase';
import { AuthContext } from '../store/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import useRecruitmentQuery, { ProjectType } from '../reactQuery/RecruitmentQuery';


export default function ProjectEdit() {

  // auth
  const userInfo = useContext(AuthContext)
  const userId = userInfo?.uid

  const params = useParams()

  //recoil
  // const [recruitmentData, setRecruitmentData] = useRecoilState(recruitment)
  // const thisData = recruitmentData.find(i=> i.id === params.id)

  //react-query
  const {isLoading:recruitmentLoading, data:recruitmentData} = useRecruitmentQuery()
  const thisData = recruitmentData?.map(i => ({...i})).find(i=> i.id === params.id)

  const [info, setInfo] = useState<ProjectType>({
    id: thisData?.id as string,
    writer: userId as string,
    state: thisData?.state as boolean,
    pic: thisData?.pic as string,
    title: thisData?.title as string,
    intro: thisData?.intro as string,
    genre: thisData?.genre as string,
    team: thisData?.team as string,
    teamNum: thisData?.teamNum as string,
    pay: thisData?.pay as string,
    schedule: thisData?.schedule as string,
    location: thisData?.location as string,
    note: thisData?.note as [],
    applicant: thisData?.applicant as [],
    confirmed: thisData?.confirmed as [],
    comments: thisData?.comments as {
      id: string,
      text: string
    } | null
  })
  const [note, setNote] = useState('')
  const [percent, setPercent] = useState<number | null>(null)
  const [file, setFile] = useState<File>()
  const navigate = useNavigate()

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


  const onCheckedItem = (checked:boolean, name:string, value:string) => {
    if(checked) {
      if(name==='genre') setInfo({...info, genre: value})
    }
  }
  const confirmHandler = async() => {
    try {
      await updateDocData('recruitment', thisData?.id as string, info)
      // .then( async() => {
      //   const result = await getRecruitmentData([])
      //   setRecruitmentData(result.sort((a,b) => Number(b.id.slice(0,12)) - Number(a.id.slice(0,12))))
      // })
    } catch(e) {
      console.log(e)
    }
  }
  return (<>
    <div className='w-full flex flex-col items-center bg-zinc-200'>
      <h2 className='mt-180 text-3xl font-bold'>???????????? ??????</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        confirmHandler()
        .then(() => navigate('/recruitment'))
        }}
        className='w-full max-w-[550px] flex flex-col pl-5 mt-5'>
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>????????? ??? ?????? ?????? ??????</label>
        <div className={`flex flex-col items-start  w-full max-w-[500px] h-[350px]`}>
          <img src={info.pic ? info.pic : DefaultImage} alt='picture' 
            className='w-48 h-48 object-cover mr-5 border border-[#9ec08c] rounded-xl'/>
          <div className="w-full mt-2 flex justify-center rounded-md border-2 border-dashed border-gray-400 bg-zinc-100  px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span className='p-2 text-base'>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" accept="image/png, image/jpeg" className="sr-only"
                    onChange={(e) => setFile(((e.target as HTMLInputElement).files as FileList)[0])}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>?????? ???</label>
        <input onChange={(e) => setInfo({...info, title: e.target.value, id:(Date.now()).toString()+e.target.value})}
          defaultValue={info.title}
          placeholder='???????????? ???????????????'
          className={`w-full max-w-[500px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black`} />
        <label htmlFor='info' className='text-black mt-10 mb-2 text-lg font-semibold'>?????? ??????</label>
        <textarea className={`w-full max-w-[500px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black`}
          onChange={(e) => setInfo({...info, intro:e.target.value})}
          id='info' name='info' rows={
            2}
          placeholder='????????? ????????? ??????????????????'
          value={info.intro}
          ></textarea>
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>??????</label>
        <div className='flex items-center justify-between w-full max-w-[500px] h-10'>
          <div className='flex items-center input'>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '??????'}
              type='radio' id='movie' value='??????' name='genre' className='mr-1'/>
            <label htmlFor='movie'>??????</label>
          </div>
          <div className='flex items-center '>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '?????????'}
              type='radio' id='drama' value='?????????' name='genre' className='mr-1'/>
            <label htmlFor='drama'>?????????</label>
          </div>
          <div className='flex items-center '>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '??????'}
              type='radio' id='adv' value='??????' name='genre' className='mr-1'/>
            <label htmlFor='adv'>??????</label>
          </div>
          <div className='flex items-center '>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '???????????????'}
              type='radio' id='music' value='???????????????' name='genre' className='mr-1'/>
            <label htmlFor='music'>???????????????</label>
          </div>
        </div>
        <div className='flex items-center justify-between w-full max-w-[500px] h-10'>
          <div className='flex items-center '>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '??????'}
              type='radio' id='broad' value='??????' name='genre' className='mr-1'/>
            <label htmlFor='broad'>??????</label>
          </div>
          <div className='flex items-center '>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '????????????'}
              type='radio' id='web' value='????????????' name='genre' className='mr-1'/>
            <label htmlFor='web'>????????????</label>
          </div>
          <div className='flex items-center input'>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '?????????'}
              type='radio' id='yt' value='?????????' name='genre' className='mr-1'/>
            <label htmlFor='yt'>?????????</label>
          </div>
          <div className='flex items-center '>
            <input onChange={(e) => {
              onCheckedItem(e.target.checked, e.target.name, e.target.value)}}
              checked={info.genre === '??????'}
              type='radio' id='genreEtc' value='??????' name='genre' className='mr-1'/>
            <label htmlFor='etc'>??????</label>
          </div>
        </div>
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>?????? ??????</label>
        <div className='flex items-center justify-between w-full max-w-[320px] h-10'>
          <label htmlFor='team-select' className='mr-2'>??? :</label>
          <select onChange={(e) => setInfo({...info, team: e.target.value})}
            className={`min-w-[110px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black mr-6`}
            name="team" id="team-select"> 
            <option value="" selected={info.team ===''}>????????????</option>
            <option value="?????????" selected={info.team ==='?????????'}>?????????</option>
            <option value="?????????" selected={info.team ==='?????????'}>?????????</option>
            <option value="?????????" selected={info.team ==='?????????'}>?????????</option>
            <option value="?????????" selected={info.team ==='?????????'}>?????????</option>
            <option value="????????????" selected={info.team ==='????????????'}>????????????</option>
            <option value="??????" selected={info.team ==='??????'}>??????</option>
          </select>
          <label htmlFor='num' className='mr-2'>?????? :</label>
          <input onChange={(e) => setInfo({...info, teamNum: e.target.value})}
            className={`text-black py-2 px-4 bg-gray-100 border rounded-md border-black`}
            type="number" id="num" name="team"  min="1" max="20" defaultValue={info.teamNum} />
        </div>
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>??????</label>
        <div className='flex items-center justify-between w-full max-w-[210px] h-10'>
          <input onChange={(e) => setInfo({...info, pay: e.target.value})}
            className={`text-black py-2 px-4 bg-gray-100 border rounded-md border-black`}
            type="number" id="num" name="team"  min="1" max="200" defaultValue={info.pay} />
          <span className='ml-2'>?????? (12?????? ??????)</span>
        </div>
        <label htmlFor='bday' className='text-black mt-10 mb-2 text-lg font-semibold'>??????</label>
        <input className='w-52 text-black py-2 px-4 bg-gray-100 border rounded-md border-black'
          onChange={(e) => setInfo({...info, schedule:e.target.value})}
          min={`${new Date().getFullYear()}-${(new Date().getMonth()+1).toString().padStart(2,'0')}-${new Date().getDate().toString().padStart(2,'0')}`}
          defaultValue={info.schedule}
          type='date' id='bday'/>
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>??????</label>
        <input onChange={(e) => setInfo({...info, location: e.target.value})}
          defaultValue={info.location}
          placeholder='?????? ????????? ???????????????'
          className={`w-full max-w-[500px] text-black py-2 px-4 bg-gray-100 border rounded-md border-black`} />
        <label className='text-black mt-10 mb-2 text-lg font-semibold'>????????????</label>
          <ul className="marker:text-sky-400 list-disc pl-5 space-y-3 text-slate-500 ">
            {info.note && info.note.map((item, index) => (
              <div key={index} className='flex justify-between w-full max-w-[430px]'>
                <li className='w-full max-w-[370px]'>{item}</li>
                <button onClick={(e) => {
                  e.preventDefault();
                  setInfo({...info, note:info.note.filter((_,i) => i !== index)})
                  }}
                  className='underline px-2'>X</button>
              </div>
            ))}

          </ul>
          <div className='w-full max-w-[520px] h-20 flex items-center justify-between'>
            <input className="w-full placeholder:italic placeholder:text-slate-400 text-black py-2 px-4 bg-gray-100 border rounded-md border-black" 
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if(e.key==="Enter") {
                  e.preventDefault();
                  setInfo({...info, note:[...info.note, note]})
                  setNote('')
                }
              }}
              placeholder='???) ????????? ????????? ????????????.' type="text" value={note} />
            <button onClick={(e) => {
              e.preventDefault();
              setNote('')
              setInfo({...info, note:[...info.note, note]})
            }}
              className='btn btn--green h-10 w-16 ml-2 p-1'>??????</button>
          </div>
        <input 
          disabled={percent !== null && percent! < 100}
          type='submit' className='btn btn--reverse border border-black mt-10 w-full max-w-[500px] disabled:bg-zinc-500' value='???????????? ?????? ??????' />
      </form>
      <div className='w-full max-w-[750px] border border-transparent border-b-gray-400 mt-16'></div>
    </div>
  </>
  )
}
