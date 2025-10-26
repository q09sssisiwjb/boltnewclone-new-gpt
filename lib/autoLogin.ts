import uuid4 from 'uuid4'

export const generateRandomCredentials = () => {
  const randomString = uuid4().split('-')[0]
  const randomNum = Math.floor(Math.random() * 9999)
  
  const username = `user_${randomString}`
  const email = `${username}_${randomNum}@tempmail.com`
  const password = `${uuid4()}`
  
  return {
    username,
    email,
    password
  }
}

export const generateRandomAvatar = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}
