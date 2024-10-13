1. Have a separate componenet, state, functions to handle image and video generation
2. Move video generation to /image/[id] as a button (generate video) on click it should trigger a popup where the popup should have two tab layout with CTA of create a video or gif based on the selected tab. Tabs are:
    1. Video:
        - It should ask video script as mandatory and audio to choose from.
        - Then have a CTA button to create the video which trigger a did talk api and using the selected image as source url and after it created the video it should redirect to that file.
    2. GIF (Silent animated video):
        - It should ask the animation types (nostalgia, fun and others)
        - Then have a CTA button to create the vide which triggeer a d id animation api using the selected image as source url and after it created the video we should convert it from mp4 to GIF and and rediect to that file.
3. Just like what we are doing with try again feature on images and we need to same but this one should open the generate video popup again with already filled in files which can be fetched from the selected image metadata and create a new video
4. Generate video button should be hidden from already videos file and remove animate video button
5. When generating a video from an image we should store the selected image as source url and show it on the metadata of the generated video.
6. After all of this we need to check if download button is working proplery for image, video and GIF
7. Remove video generation feature from /generate



















{generatedImage && !imageApproved && mode === "video" && (
        <div className="w-full max-w-lg mt-3">
          <button
            className="btn  btn-blue bg-gray-400 h-10 flex items-center justify-center disabled:opacity-50"
            onClick={() => setImageApproved(true)}
          >
            Approve Image To Proceed
          </button>
        </div>
      )}

      {imageApproved && mode === "video" && (
        <div className="flex mt-10 flex-col w-full max-w-xl space-y-4 relative">
          {mode === "video" && (
            <TextareaAutosize
              autoFocus
              minRows={4}
              value={scriptPrompt || ""}
              placeholder="Write the script here (optional)"
              onChange={(e) => {
                setScriptPrompt(e.target.value);
                handleTagSuggestions(e.target.value);
              }}
              className="border-2 text-xl border-blue-500 bg-blue-100 rounded-md px-3 py-2 w-full"
            />
          )}
          {mode === "video" && (
            <div>
              <div>Video Model</div>
              <Select
                isClearable={true}
                isSearchable={true}
                name="videoModel"
                onChange={(v) =>
                  setVideoModel(v ? (v as SelectModel).value : "d-id")
                }
                defaultValue={findModelByValue("d-id")}
                options={models.filter((m) => m.type === "video")}
                styles={selectStyles}
              />
            </div>
          )}

          {mode === "video" && (
            <div>
              <div>Audio</div>

              <Select
                isClearable={true}
                isSearchable={true}
                name="audio"
                onChange={(v) => setAudio(v ? v.value : "Matthew")}
                options={audios.map((audio) => ({
                  id: audio.id,
                  label: audio.label,
                  value: audio.value,
                }))}
                defaultInputValue={"Matthew"}
                styles={selectStyles}
                placeholder="Select audio"
              />
            </div>
          )}

          {model != "dall-e" && imageApproved && (
            <>
              <div>Avatar Preview</div>
              <div className="mt-4 relative">
                <img
                  src={lastImageUrl}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-md border-2 border-blue-600"
                />
              </div>
            </>
          )}

          <button
            className="btn btn-blue h-10 flex items-center justify-center disabled:opacity-50"
            disabled={loading}
            onClick={(e) => {
              setPromptData({
                ...promptData,
                freestyle: imagePrompt,
                style: imageStyle,
                colorScheme: getColorFromLabel(colorScheme) || colors[0].value,
                lighting: getLightingFromLabel(lighting) || lightings[0].value,
                tags,
              });
              handleGenerateSDXL(e);
            }}
          >
            {loading ? <PulseLoader color="#fff" size={12} /> : "Create Video"}
          </button>
        </div>
      )}

      {imageApproved && mode === "video" && (
        <div className="w-full max-w-2xl mt-6 flex justify-center">
          {/* Video Section */}
          {generatedVideo ? (
            <div className="video-container">
              <video
                className="object-cover rounded-md"
                src={generatedVideo}
                controls
              />
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              No video generated yet.
            </div>
          )}
        </div>
      )}


















      if (scriptPrompt === null) {
      // Handling for DALL-E Model
      if (model === "dall-e") {
        if (img) {
          formData = new FormData();
          formData.append("image", img);
          formData.append("prompt", message!);
          formData.append("n", "1");
          formData.append("size", "1024x1024");

          apiUrl = `https://api.openai.com/v1/images/edits`;
          headers = {
            Authorization: `Bearer ${useCredits ? process.env.OPENAI_API_KEY! : openAPIKey!
              }`,
          };
        } else {
          apiUrl = `https://api.openai.com/v1/images/generations`;
          requestBody = {
            prompt: message!,
            n: 1,
            size: "1024x1024",
          };
          headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useCredits ? process.env.OPENAI_API_KEY! : openAPIKey!
              }`,
          };
        }
      }
      // Handling for Stable Diffusion XL Model
      else if (model === "stable-diffusion-xl") {
        if (img) {
          formData = new FormData();
          formData.append("init_image", img);
          formData.append("prompt", message!);
          formData.append("init_image_mode", "IMAGE_STRENGTH");
          formData.append("image_strength", "0.5");
          formData.append("cfg_scale", "7");
          formData.append("seed", "1");
          formData.append("steps", "30");
          formData.append("safety_check", "false");

          apiUrl =
            "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image";
          headers = {
            Accept: "image/jpeg",
            Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
              }`,
          };
        } else {
          apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
          requestBody = {
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
            seed: 0,
            safety_check: false,
            prompt: message!,
          };
          headers = {
            "Content-Type": "application/json",
            Accept: "image/jpeg",
            Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
              }`,
          };
        }
      }
      // Handling for Stability SD3 Turbo Model
      else if (model === "stability-sd3-turbo") {
        formData = new FormData();
        if (img) {
          formData.append("mode", "image-to-image");
          formData.append("image", img);
          formData.append("strength", "0.7");
        } else {
          formData.append("mode", "text-to-image");
          formData.append("aspect_ratio", "1:1");
        }
        formData.append("prompt", message!);
        formData.append("output_format", "png");
        formData.append("model", "sd3-turbo");
        formData.append("isValidPrompt", "true");

        apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
        headers = {
          Accept: "image/*",
          Authorization: `Bearer ${useCredits ? process.env.STABILITY_API_KEY! : stabilityAPIKey!
            }`,
        };
      }
      // Handling for Playground V2 Model
      else if (model === "playground-v2" || model === "playground-v2-5") {
        if (img) {
          formData = new FormData();
          formData.append("init_image", img);
          formData.append("prompt", message!);
          formData.append("init_image_mode", "IMAGE_STRENGTH");
          formData.append("image_strength", "0.5");
          formData.append("cfg_scale", "7");
          formData.append("seed", "1");
          formData.append("steps", "30");
          formData.append("safety_check", "false");

          apiUrl =
            "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic/image_to_image";
          headers = {
            Accept: "image/jpeg",
            Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
              }`,
          };
        } else {
          apiUrl =
            "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic";
          requestBody = {
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
            seed: 0,
            safety_check: false,
            prompt: message!,
          };
          headers = {
            "Content-Type": "application/json",
            Accept: "image/jpeg",
            Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
              }`,
          };
        }
      }

      // If no apiUrl is found, throw an error
      if (!apiUrl) {
        throw new Error("Invalid model type");
      }

      // Send the request to the external API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: formData || JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Error from Image API: ${response.status} ${response.statusText}`
        );
      }

      // Handle image response based on model
      let imageData: ArrayBuffer;

      if (model === "dall-e") {
        const dalleResponse: DalleResponse =
          (await response.json()) as DalleResponse;
        const imageUrl = dalleResponse.data[0].url;
        imageData = await fetch(imageUrl).then((res) => res.arrayBuffer());
      } else {
        imageData = await response.arrayBuffer();
      }

      const finalImage = Buffer.from(imageData);

      // Save the generated image to Firebase
      const fileName = `generated/${uid}/${Date.now()}.jpg`;
      const file = adminBucket.file(fileName);

      await file.save(finalImage, {
        contentType: "image/jpeg",
      });

      const metadata = {
        metadata: {
          prompt: message!,
        },
      };

      await file.setMetadata(metadata);

      const [imageUrl] = await file.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });

      imageUrls = imageUrl
      let imageReference;

      // Handle uploaded image reference
      if (img) {
        imageReference = Buffer.from(await img.arrayBuffer());

        const referenceFileName = `image-references/${uid}/${Date.now()}.jpg`;
        const referenceFile = adminBucket.file(referenceFileName);

        await referenceFile.save(imageReference, {
          contentType: "image/jpeg",
        });

        const [imageReferenceUrl] = await referenceFile.getSignedUrl({
          action: "read",
          expires: "03-17-2125",
        });

        imageReference = imageReferenceUrl;
        imageReferences = imageReferenceUrl;
      }
    }



    if (scriptPrompt === "" && videoModel === "d-id") {
      let options: {
        method: string;
        headers: {
          accept: string;
          'content-type': string;
          authorization: string;
        };
        body?: string;
      };
      let url = 'https://api.d-id.com/animations';
      options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didAPIkey : process.env.DID_API_KEY}`
        },
        body: JSON.stringify({
          source_url: imageUrls,
          driver_url: 'bank://nostalgia',
          config: {
            mute: true,
            stitch: true
          }
        })
      };

      // Proceed with the D-ID API call as usual
      const didResponse: DidResponse = await (await fetch(url, options)).json() as DidResponse;
      const {
        id
      } = didResponse;

      if (!id) {
        throw new Error("D-ID API Token is invalid or credits issue.");
      }

      // Get the result as usual
      url = `https://api.d-id.com/animations/${id}`;
      options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didAPIkey : process.env.DID_API_KEY}`
        },
      };

      let result: ResultResponse = {};
      let attemptCount = 0;

      while (true) {
        attemptCount++;
        if (attemptCount > 24) {
          console.log("Exceeded maximum retry attempts. Exiting loop.");
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        const response = await fetch(url, options);
        result = await response.json() as ResultResponse;
        if (result.error) {
          return { error: result.error.description }
        }
        if (result.result_url) break;
      }

      return {
        videoUrl: result.result_url,
        imageUrls
      };
    }
    else if (scriptPrompt && videoModel === "d-id") {
      let options: {
        method: string;
        headers: {
          accept: string;
          'content-type': string;
          authorization: string;
        };
        body?: string;
      };

      let url = 'https://api.d-id.com/talks';
      options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didAPIkey : process.env.DID_API_KEY}`
        },
        body: JSON.stringify({
          source_url: imageUrls,
          script: {
            type: 'text',
            subtitles: 'false',
            provider: {
              type: 'amazon',
              voice_id: audio
            },
            input: scriptPrompt
          },
          config: {
            fluent: 'false',
            pad_audio: '0.0',
            stitch: true
          }
        })
      };

      const didResponse: DidResponse = await (await fetch(url, options)).json() as DidResponse;
      const {
        id
      } = didResponse;

      if (!id) {
        if (didResponse?.description == 'not enough credits') {
          throw new Error("D-ID API not enough credits.")
        } else if (didResponse?.kind == 'ValidationError') {
          throw new Error("Validation Error")
        } else {
          throw new Error("D-ID API Token is invalid.")
        }
      }

      url = `https://api.d-id.com/talks/${id}`;
      options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${useCredits ? didAPIkey : process.env.DID_API_KEY}`
        },
      };

      let result: ResultResponse = {};

      let attemptCount = 0;

      while (true) {
        attemptCount++;
        if (attemptCount > 24) {
          console.log("Exceeded maximum retry attempts. Exiting loop.");
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        const response = await fetch(url, options);

        result = await response.json() as ResultResponse;

        if (result.error) {
          return { error: result.error.description }
        }

        if (result.result_url) break;
      }

      return {
        videoUrl: result.result_url,
        imageUrls
      }
    } 