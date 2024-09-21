import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Grid,
  GridItem,
  useToast,
  Flex,
  Spinner,
  Text,
  Radio,
  RadioGroup,
  useColorModeValue
} from '@chakra-ui/react';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('audio');
  const [link, setLink] = useState('');
  const [prompt, setPrompt] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState('file');
  const toast = useToast();

  const formBg = useColorModeValue('white', 'gray.700');
  const responseBg = useColorModeValue('white', 'gray.800');

  const onSubmit = async () => {
    if (!prompt) {
      toast({
        title: 'Error',
        description: 'Prompt is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    if (inputType === 'file' && !file) {
      toast({
        title: 'Error',
        description: 'Please upload a file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    if (inputType === 'link' && !link) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append('prompt', prompt);
  
    
      if (fileType === 'audio') {
        formData.append('audio_file', file);
      } if (fileType === 'pdf')  {
        formData.append('pdf_file', file);
      }
     if (fileType === 'link')  {
      formData.append('start_url', link);
    }
  
    try {
      const response = await fetch('https://eduaix.onrender.com/process/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Network response was not ok');
      }
  
      const result = await response.json();
      setSubmittedData(result['Answer ']);
      toast({
        title: 'Success',
        description: 'Data processed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading the file or sending data:', error);
      toast({
        title: 'Error',
        description: `Error processing request: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid templateColumns="1fr 1fr" gap={8} p={8}>
      <GridItem>
        <Box bg={formBg} p={8} borderRadius="xl" boxShadow="lg">
          <Stack spacing={4}>
            <FormControl as="fieldset">
              <FormLabel as="legend">Input Type</FormLabel>
              <RadioGroup defaultValue="file" onChange={setInputType} value={inputType}>
                <Stack direction="row">
                  <Radio value="file">File Upload</Radio>
                  <Radio value="link">URL</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {inputType === 'file' && (
              <>
                <FormControl as="fieldset">
                  <FormLabel as="legend">File Type</FormLabel>
                  <RadioGroup defaultValue="audio" onChange={setFileType} value={fileType}>
                    <Stack direction="row">
                      <Radio value="audio">Audio</Radio>
                      <Radio value="pdf">PDF</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Upload {fileType === 'audio' ? 'Audio' : 'PDF'}</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept={fileType === 'audio' ? 'audio/*' : '.pdf'}
                  />
                </FormControl>
              </>
            )}

            {inputType === 'link' && (
              <FormControl>
                <FormLabel>Add Link</FormLabel>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>Prompt</FormLabel>
              <Textarea
                placeholder="Enter Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </FormControl>
            <Button colorScheme="blue" type="submit" onClick={onSubmit} isLoading={loading}>
              Submit
            </Button>
          </Stack>
        </Box>
      </GridItem>

      <GridItem>
        <Box bg={responseBg} p={8} borderRadius="xl" boxShadow="lg">
          <Stack spacing={4}>
            {loading ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                minH="100vh"
                bg={responseBg}
              >
                <Spinner size="xl" color="teal.500" />
                <Text mt={4} fontSize="lg" fontWeight="semibold">
                  Processing...
                </Text>
              </Flex>
            ) : (
              <Box>
                <strong>Response:</strong>
                <Box>
                  {submittedData}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      </GridItem>
    </Grid>
  );
}

export default UploadForm;
