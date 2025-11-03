import { 
  Box, Button, Heading, Text, VStack, Input, Center, Icon, Flex, Image 
} from "@chakra-ui/react";
import { useState, useCallback, useRef } from "react";
import { ArtistParams } from "../ArtistParams";
import { FaFileUpload } from "react-icons/fa";
import Webcam from "react-webcam";
import { MdCameraswitch, MdPhotoCamera } from "react-icons/md";
import { Toaster, toaster } from "../../../components/ui/toaster";

const videoConstraints = {
  width: 420,
  height: 420,
  facingMode: "user",
};

export const PhotoGenerateScreen = ({ onClose }: { onClose: () => void }) => {
  const [screen, setScreen] = useState<
    "select" | "camera" | "preview" | "artistParams"
  >("select");

  const [isDragging, setIsDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Унифицированная функция показа ошибки
  const showError = (message: string) => {
    setError(message);
    toaster.create({ description: message, type: "error" });
  };

  // ✅ Проверка и загрузка файла
  const handleFileValidation = (file: File) => {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      return showError("Неверный тип файла. Выберите .png или .jpg");
    }

    if (file.size > 5 * 1024 * 1024) {
      return showError("Файл слишком большой (макс. 5 МБ)");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setScreen("preview");
    };
    reader.readAsDataURL(file);
  };

  // ✅ Drag & Drop
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileValidation(file);
  }, []);

  // ✅ File input
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileValidation(file);
  };

  // ✅ Захват фото с камеры
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setScreen("preview");
    }
  }, []);

  // ✅ Переход к ArtistParams
  if (screen === "artistParams") {
    return (
      <VStack gap={4} w="full" p={4}>
        <ArtistParams
          onBack={() => setScreen("preview")}
          onCancel={onClose}
          onGenerate={onClose}
        />
      </VStack>
    );
  }

  // ✅ Предпросмотр фото
  if (screen === "preview") {
    return (
      <VStack gap={6} p={6} w="full">
        {imgSrc && <Image src={imgSrc} borderRadius="24px" />}
        <Button
          w="full"
          h="60px"
          bg="#F59A0E"
          color="white"
          borderRadius="16px"
          _hover={{ bg: "#D98B0C" }}
          onClick={() => setScreen("artistParams")}
        >
          Использовать это фото
        </Button>
        <Button
          w="full"
          h="60px"
          variant="outline"
          borderColor="#2A2A2D"
          borderRadius="16px"
          _hover={{ bg: "#232325" }}
          onClick={() => {
            setImgSrc(null);
            setScreen("select");
          }}
        >
          Выбрать другое
        </Button>
      </VStack>
    );
  }

  // ✅ Камера
  if (screen === "camera") {
    return (
      <VStack gap={4} w="full" p={4}>
        <Box
          w="full"
          h="400px"
          bg="black"
          borderRadius="24px"
          overflow="hidden"
          position="relative"
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            height="100%"
            videoConstraints={videoConstraints}
            style={{ objectFit: "cover" }}
          />
        </Box>

        <Flex w="full" justify="space-around" alignItems="center">
          <Button variant="ghost" onClick={() => setScreen("select")}>
            Назад
          </Button>
          <Button
            onClick={capture}
            bg="#F59A0E"
            color="white"
            _hover={{ bg: "#D98B0C" }}
          >
            <Icon as={MdPhotoCamera} mr={2} />
            Сделать снимок
          </Button>
          <Button variant="ghost">
            <Icon as={MdCameraswitch} boxSize={8} />
          </Button>
        </Flex>
      </VStack>
    );
  }

  // ✅ Основной экран выбора
  return (
    <VStack gap={4} p={6} w="full" color="white">
      <Heading size="lg">Песня по фото</Heading>
      <Text color="#8A8A8A">Загрузите фото, чтобы создать трек</Text>

      {error && <Text color="red.500">{error}</Text>}

      <Center
        w="full"
        h="200px"
        bg={isDragging ? "#2A2A2D" : "#1E1E20"}
        border="2px dashed"
        borderColor={error ? "red.500" : "#2A2A2D"}
        borderRadius="24px"
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        position="relative"
        cursor="pointer"
        onClick={() => inputRef.current?.click()}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={onFileChange}
          position="absolute"
          width="full"
          height="full"
          opacity={0}
          cursor="pointer"
        />
        <VStack>
          <Icon as={FaFileUpload} boxSize={8} color="#8A8A8A" />
          <Text color="#C6C6C6">Перетащите фото сюда</Text>
          <Text fontSize="sm" color="#8A8A8A">
            или выберите файл
          </Text>
        </VStack>
      </Center>

      <Button
        w="full"
        h="60px"
        variant="outline"
        borderColor="#2A2A2D"
        borderRadius="16px"
        _hover={{ bg: "#232325" }}
        onClick={() => setScreen("camera")}
      >
        Сделать снимок
      </Button>

      <Toaster />
    </VStack>
  );
};
