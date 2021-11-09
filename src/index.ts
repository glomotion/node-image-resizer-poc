import axios from "axios";
import sharp from "sharp";
import path from "path";

type Collection = {
  address: string;
  name: string;
  description?: string;
  icon_url: string;
  collection_image_url: string;
};

function slugifyName(name: string) {
  return name
    .toLocaleLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

async function fetchCollections() {
  try {
    const { data } = await axios.get(
      "https://api.x.immutable.com/v1/collections"
    );
    return data.result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function processImage(collections: Collection[]) {
  let count = 0;
  for (let collection of collections) {
    try {
      if (!collection.collection_image_url) return;
      count += 1;
      console.log("$$$$$$$$$$$$$$ PROCESSING:", count, collection);
      const imageBuffer = (
        await axios({
          url: collection.collection_image_url,
          responseType: "arraybuffer",
        })
      ).data as Buffer;
      await sharp(imageBuffer)
        .resize({ width: 256 })
        .webp({ quality: 85 })
        .toFile(
          path.join(
            __dirname,
            `../output/${count}--256w--${slugifyName(
              collection.name
            )}--collection_image_url.webp`
          )
        );
    } catch (err) {
      console.error("@@@@@@@@@@", err);
    }
  }
  console.log("@@@@@@@@@@ COMPLETE @@@@@@@@@@");
}

fetchCollections().then(processImage);
