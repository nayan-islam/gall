import React, { useEffect, useState } from "react";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  getDatabase,
  ref as realTimeRef,
  set,
  push,
  onValue,
  remove,
} from "firebase/database";

const App = () => {
  // ==============================================================

  let [one, setOne] = useState();
  let [igmName, setigmName] = useState();
  let [arr, setArr] = useState([]);

  const uploadToGallery = (e) => {
    console.log(e.target.files);

    let jekono = e.target.files[0];

    setigmName(jekono.name + Date.now());

    if (jekono) {
      let fileRender = new FileReader();

      fileRender.onload = (data) => {
        setOne(data.target.result);
      };

      fileRender.readAsDataURL(jekono);
    }
  };

  // console.log(one);

  // ==============================================================
  let getDatabase2 = getDatabase();
  let realTimeRef2 = realTimeRef(getDatabase2, "imageData");

  const storage = getStorage();
  const storageRef = ref(storage, igmName);

  // Data URL string
  const uploadImageString = () => {
    uploadString(storageRef, one, "data_url").then(() => {
      getDownloadURL(storageRef).then((item) => {
        set(push(realTimeRef2), { imageUrl: item, imageId: igmName }).then(
          () => {
            setigmName("");
            setOne("");
          }
        );
      });
    });
  };

  useEffect(() => {
    onValue(realTimeRef2, (items) => {
      let myCustomarr = [];

      items.forEach((el) => {
        myCustomarr.push({
          ...el.val(),
          id: el.key,
        });
      });

      setArr(myCustomarr);
    });
  }, []);

  const handleDelete = (id, imageId) => {
    // console.log(id, imageId);

    remove(realTimeRef(getDatabase2, "imageData/" + id)).then(() => {
      // Create a reference to the file to delete
      const desertRef = ref(storage, imageId);

      deleteObject(desertRef)
        .then(() => {
          // File deleted successfully
          console.log("file delete");
        })
        .catch((error) => {
          // Uh-oh, an error occurred!
        });
    });
  };

  // console.log("arr", arr);

  // ==============================================================

  return (
    <div>
      <div className="">
        <label htmlFor="hello">
          <input
            id="hello"
            type="file"
            onChange={uploadToGallery}
            className="hidden"
          />
          sfew
        </label>
      </div>
      <button onClick={uploadImageString} className="bg-slate-500">
        upload
      </button>

      <div className="main">
        {arr.map((el) => (
          <div>
            <img src={el.imageUrl} alt="" />
            <h2>
              <button onClick={() => handleDelete(el.id, el.imageId)}>
                Delete
              </button>
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
