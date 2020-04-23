var likes = document.getElementsByClassName("fa-heart");
var trash = document.getElementsByClassName("fa-trash");

Array.from(likes).forEach(function(element) {
      element.addEventListener('click', function(){
        const imgPath = this.parentNode.parentNode.childNodes[3].innerText
        const _id = this.parentNode.parentNode.getAttribute("data-id")
        const caption = this.parentNode.parentNode.childNodes[5].innerText
        const likes = this.parentNode.parentNode.getAttribute("data-likes")
        const followingId = this.parentNode.parentNode.getAttribute("data-following")
        console.log(followingId, "follow")
        console.log(element.classList, "here")
        if(element.classList.contains("liked")){
          element.classList.remove("liked")
        fetch('unlike', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'imgPath': imgPath,
            '_id': _id,
            'caption': caption,
            'fave': "",
            'following': "",
            'follow': "false"
          })
        })
        .then((data) => {
          console.log('Success:', data);
          window.location.reload(true)
        })
          .catch((error) => {
          console.error('Error:', error);
          });
        }else{
          console.log("here again")
          element.classList.add("liked")

          fetch('posts', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              'imgPath': imgPath,
              '_id': _id,
              'caption': caption,
              'fave':'liked',
              'following': followingId,
              'follow': "true"
            })
          })
          .then((data) => {
            console.log('Success:', data);
            window.location.reload(true)
          })
            .catch((error) => {
            console.error('Error:', error);
            });
        }
      });
});

// Array.from(likes).forEach(function(element) {
//       element.addEventListener('click', function(){
//         const imgPath = this.parentNode.parentNode.childNodes[3].innerText
//         const _id = this.parentNode.parentNode.getAttribute("data-id")
//         const caption = this.parentNode.parentNode.childNodes[5].innerText
//         // const likes = this.parentNode.parentNode.getAttribute("data-likes")
//         // console.log(likes)
//         fetch('favorite', {
//           method: 'post',
//           headers: {'Content-Type': 'application/json'},
//           body: JSON.stringify({
//              postId: _id
//           })
//         })
//         .then((response) => {
//         console.log('success1', response);
//         response.json()
//       })
//         .then((data) => {
//           console.log('Success:', data);
//           window.location.reload(true)
//         })
//           .catch((error) => {
//           console.error('Error:', error);
//           });
//       });
// });


Array.from(trash).forEach(function(element) {
  element.addEventListener('click', function(){
    const imgPath = this.parentNode.parentNode.childNodes[3].src
    const _id = this.parentNode.parentNode.getAttribute("data-id")
     console.log(this.parentNode.parentNode)
    const caption = this.parentNode.parentNode.childNodes[5].innerText
    const likes = this.parentNode.parentNode.childNodes[7].innerText //
    // const heart = this.parentNode.parentNode.childNodes[9].innerText

    // console.log(imgPath)
    // console.log( _id )
    // console.log(caption)
    // console.log(likes)
    // console.log(heart)
    fetch('posts', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'imgPath': imgPath,
        '_id': _id,
        'caption': caption,
        'likes': likes,
        // 'heart':
        'trash': this.parentNode.parentNode
      })
    }).then(function (response) {
      if(response.ok === false){
        alert("delete failed")
        return
      }else{
      const postElement = element.closest("li")
      postElement.remove()
     // window.location.reload()
      }
    })
    .then(data => {
      console.log(data)
      // window.location.reload(true)
    })
  });
});
