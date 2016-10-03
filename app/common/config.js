'use strict'
//noinspection JSUnresolvedVariable
module.exports = {
    header:{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    },
    qiniu:{
      upload:'http://upload.qiniu.com'
    },
    cloudinary:{
      cloud_name: 'supersea',
      api_key: '815174356727538',
      base: 'http://res.cloudinary.com/supersea',
      image: 'https://api.cloudinary.com/v1_1/supersea/image/upload',
      video: 'https://api.cloudinary.com/v1_1/supersea/video/upload',
      audio: 'https://api.cloudinary.com/v1_1/supersea/raw/upload'
    },
    api:{
        base:'http://localhost:1234/',
        //base:'http://rap.taobao.org/mockjs/7899/',
        creations: 'api/creations',
        up:'api/up',
        comment:'api/comments',
        signup:'api/u/signup',
        verify:'api/u/verify',
        signature:'api/signature',
        update:'api/u/update'
    }

}