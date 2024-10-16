Generate.me

1. On /images/[id] add a button to create a GIF for the video file only. This should convert the MP4 video to a GIF and upload the file to Firebase Storage and it should save it to Firebase as a new document. Ensure that the new document has a unique ID, timestamp, and a video download URL pointing to the GIF everything else should be a copy of the original video file. Redirect after the upload.  
   Note: It shouldn't update the current file.  
   A. After implementing this check if downloading the GIF works if not implement a solution.  
   B. Ensure the GIF plays correctly.  

2. Research additional image models to integrate such as Imagen from Google, RunwayML.com, and others.

3. Develop ideas to improve the user experience (UX) of image generation.

4. Investigate the possibility of creating a slow animation where the avatar is just listening. The current animation of D-ID has a lot of movement but we shouldn’t remove the existing animation list for the silent animation. We can try a new endpoint or settings for this.

5. Add video models beyond D-ID, such as Heygen, Synthesia, and Travus, while ensuring their pricing is affordable and that they offer a free trial for testing.