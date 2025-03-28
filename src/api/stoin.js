import { postRequest, getRequest } from "../utils/api"

export function getStoinList(params) {
  return getRequest('/version/ht/matterStoin/list', params)
}

export function getStoinDetail(id) {
  return getRequest(`/version/ht/matterStoin/info/${id}`)
}

export function saveStoin(data) {
  return postRequest('/version/ht/matterStoin/save', data)
}

export function deleteStoin(id) {
  return getRequest(`/version/ht/matterStoin/delete/${id}`)
}