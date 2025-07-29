import React, { useEffect, useRef, useState } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import {parse} from 'marked'

const AddBlog = () => {
  const { axios } = useAppContext()
  const [isAdding, setIsAdding] = useState(false)
  const [ loading, setLoading] = useState(false)
  const editorRef = useRef(null)
  const quillRef = useRef(null)
  const [image, setImage] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      const blog = {
        title,
        subTitle,
        description: quillRef.current.root.innerHTML,
        category,
        isPublished,
      }

      console.log('📦 Blog Data:', blog)

      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      formData.append('image', image)

      const token = localStorage.getItem('token')
      console.log('🔑 Retrieved Token:', token)

      if (!token) {
        console.warn('❌ Token not found in localStorage.')
        toast.error('Unauthorized: No token found.')
        return
      }

      const { data } = await axios.post('http://localhost:3000/api/blog/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('✅ Server Response:', data)

      if (data.success) {
        toast.success(data.message)
        setImage(false)
        setTitle('')
        quillRef.current.root.innerHTML = ''
        setCategory('Startup')
        setSubTitle('')
        setIsPublished(false)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error('🚨 Error submitting blog:', error)
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsAdding(false)
    }
  }

  const generateContent = async () => {
  if (!title) return toast.error('Please enter the title');
  
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized: No token found.');
      return;
    }

    const { data } = await axios.post('/api/blog/generate', 
      { prompt: title }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.success) {
      quillRef.current.root.innerHTML = parse(data.content);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      })
      console.log('🖋️ Quill editor initialized')
    }
  }, [])

  return (
    <form onSubmit={onSubmitHandler} className='flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll'>
      <div className='bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded'>

        <p>Upload image</p>
        <label htmlFor="image">
          <img
            src={!image ? assets.upload_area : URL.createObjectURL(image)}
            alt=""
            className='mt-2 h-16 rounded cursor-pointer'
          />
          <input
            onChange={(e) => {
              console.log('🖼️ Selected image:', e.target.files[0])
              setImage(e.target.files[0])
            }}
            type="file"
            id='image'
            hidden
            required
          />
        </label>

        <p className='mt-4'>Blog title</p>
        <input
          type="text"
          onChange={e => setTitle(e.target.value)}
          value={title}
          placeholder='Type here'
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded hover:border-black'
          required
        />

        <p className='mt-4'>Sub title</p>
        <input
          type="text"
          onChange={e => setSubTitle(e.target.value)}
          value={subTitle}
          placeholder='Type here'
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded hover:border-black'
          required
        />

        <p className='mt-4'>Blog Description</p>
        <div className='max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative'>
          <div ref={editorRef}></div>
          {loading && ( <div className='absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center'>
              <div className='w-8 h-8 rounded-full border-2 border-t-white animate-spin'></div>
          </div> )}
          <button disabled={loading}
            className='absolute bottom-1 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer'
            type='button'
            onClick={generateContent}
          >
            Generate with AI
          </button>
        </div>

        <p className='mt-4'>Blog Category</p>
        <select
          onChange={e => setCategory(e.target.value)}
          value={category}
          className='mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded'
          name="category"
          required
        >
          <option value="">Select Category</option>
          {blogCategories.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>

        <div className='flex gap-2 mt-4'>
          <p>Publish Now</p>
          <input
            onChange={e => setIsPublished(e.target.checked)}
            type="checkbox"
            checked={isPublished}
            className='scale-125 cursor-pointer'
          />
        </div>

        <button
          disabled={isAdding}
          type='submit'
          className='mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm'
        >
          {isAdding ? 'Adding...' : 'Add Blog'}
        </button>
      </div>
    </form>
  )
}

export default AddBlog
