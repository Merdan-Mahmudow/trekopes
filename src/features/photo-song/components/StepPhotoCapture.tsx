import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { setPhotoData, setFlowStep } from "@/store/photo-song";

export const StepPhotoCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      setCameraError("Камера недоступна или доступ запрещен.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const processImage = (imageSrc: string) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const MAX_WIDTH = 2048;
      const MAX_HEIGHT = 2048;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPhotoData({ dataUrl, w: width, h: height });
      setFlowStep("extras");
    };
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        processImage(dataUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          processImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <VStack spacing={4} w="full">
      <Heading>Музыка по фото</Heading>
      <Box
        w="full"
        h="400px"
        bg="gray.800"
        borderRadius="20px"
        position="relative"
      >
        {cameraError ? (
          <Flex justify="center" align="center" h="full">
            <Text color="red.500">{cameraError}</Text>
          </Flex>
        ) : (
          <video ref={videoRef} autoPlay style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px" }} />
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Box>
      <Flex w="full" justify="space-around">
        <Button onClick={handleCapture}>Снять</Button>
        <Button as="label" htmlFor="gallery-input">
          Из галереи
          <input id="gallery-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </Button>
      </Flex>
    </VStack>
  );
};
