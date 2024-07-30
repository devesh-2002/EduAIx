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
} from '@chakra-ui/react';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate saving or processing the form data
    const data = {
      file: file ? file.name : 'No file selected',
      link,
      description,
    };
    setSubmittedData(data);

    // Reset form fields
    setFile(null);
    setLink('');
    setDescription('');
  };

  return (
    <Grid templateColumns="1fr 1fr" gap={8} p={8}>
      <GridItem>
        <Box bg="light-green" p={8} borderRadius="xl" boxShadow="lg">
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Upload Audio or PDF</FormLabel>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Add Link</FormLabel>
                <Input type="text" value={link} onChange={handleLinkChange} placeholder="https://example.com" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Enter Question"
                />
              </FormControl>
              <Button colorScheme="blue" type="submit">
                Submit
              </Button>
            </Stack>
          </form>
        </Box>
      </GridItem>

      <GridItem>
        <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
          <Stack spacing={4}>
            <Box>
              <strong>Description:</strong> {submittedData ? submittedData.description : ''}
            </Box>
          </Stack>
        </Box>
      </GridItem>
    </Grid>
  );
}

export default UploadForm;
