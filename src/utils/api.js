import axios from 'axios'

export const postRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${url}`,
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  })
}

export const getRequest = (url, params) => {
  return axios({
    method: 'get',
    url: `${url}`,
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  })
}

export const uploadFileRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${url}`,
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const fielDownload = (fileUrl, fileName) => {
  axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'blob'
  }).then((response) => {
    var fileURL = window.URL.createObjectURL(new Blob([response.data]))
    var fileLink = document.createElement('a')
    fileLink.href = fileURL
    fileLink.setAttribute('download', fileName)
    document.body.appendChild(fileLink)
    fileLink.click()
  })
}

export const formatDate = (time) => {
  if (!time) return '--'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatFullDate = (time) => {
  if (!time) return '--'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 时间戳转换为日期的函数
export const timestampToDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export const getDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
