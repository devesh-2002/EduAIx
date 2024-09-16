import React, { useState } from 'react';
import {
  Box,
  Center,
  Heading,
  Input,
  Button,
  FormLabel,
  VStack,
  Textarea,
  useToast,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Divider,
  Stack
} from '@chakra-ui/react';
import jsPDF from 'jspdf';

const PaperCorrection = () => {
  const [answerSheet, setAnswerSheet] = useState(null);
  const [qaLoader, setQaLoader] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const isFormValid = () => {
    return answerSheet && qaLoader && prompt.trim() !== '';
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'answer_sheet_loader') {
      setAnswerSheet(files[0]);
    } else if (name === 'q_a_loader') {
      setQaLoader(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast({
        title: 'Missing fields.',
        description: 'Please fill out the prompt and upload both answer sheet and QA loader files.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('answer_sheet_loader', answerSheet);
    formData.append('q_a_loader', qaLoader);
    formData.append('prompt', prompt);

    setIsSubmitting(true);

    try {
      const response = await fetch('https://eduaix.onrender.com/paper-correction', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResponseData(data);
        setIsModalOpen(true);
        setAnswerSheet(null);
        setQaLoader(null);
        setPrompt('');
      } else {
        throw new Error(data.message || 'Failed to upload files.');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    if (!responseData) return;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 40;
    let y = margin;
  
    const addText = (text, fontSize, isBold = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) pdf.setFont(undefined, 'bold');
      else pdf.setFont(undefined, 'normal');
  
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach(line => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += fontSize + 5;
      });
      y += 10; 
    };
  
    addText('Detailed Response', 16, true);
    addText('Summary:', 14, true);
    addText(`Total Grade: ${responseData.total_grade}`, 12);
  
    responseData.results.forEach((result, index) => {
      addText(`Result ${index + 1}:`, 14, true);
      addText(`Question: ${result.question}`, 12);
      addText(`Answer: ${result.student_answer}`, 12);
      addText(`Feedback: ${result.feedback}`, 12);
      y += 20; 
    });
  
    pdf.save('response.pdf');
  };
    return (
    <>
      <Center mb={6}>
        <Heading as="h1" size="xl">Welcome to AI-based Paper Corrector!</Heading>
      </Center>

      <Box p={6} maxW="lg" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="lg">
        <VStack spacing={6} align="stretch">
          <form onSubmit={handleSubmit}>
            <FormControl id="prompt" isRequired isInvalid={!prompt.trim()}>
              <FormLabel>Prompt*</FormLabel>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                size="lg"
                resize="vertical"
              />
            </FormControl>

            <FormControl id="answer_sheet_loader" isRequired>
              <FormLabel mt={4}>Context - Textbook Loader*</FormLabel>
              <Input
                type="file"
                name="answer_sheet_loader"
                accept="application/pdf, .doc, .docx"
                onChange={handleFileChange}
                required
              />
            </FormControl>

            <FormControl id="q_a_loader" isRequired>
              <FormLabel mt={4}>QA Loader*</FormLabel>
              <Input
                type="file"
                name="q_a_loader"
                accept="application/pdf, .doc, .docx"
                onChange={handleFileChange}
                required
              />
            </FormControl>

            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Submit
            </Button>
          </form>
        </VStack>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detailed Response</ModalHeader>
            <ModalBody>
              {responseData ? (
                <>
                  <Box mb={4} p={4} borderWidth={1} borderRadius="md" boxShadow="md">
                    <Text fontSize="lg" fontWeight="bold">Summary</Text>
                    <Divider my={2} />
                    <Text><strong>Total Grade:</strong> {responseData.total_grade}</Text>
                    {/* <Text><strong>Max Possible Grade:</strong> {responseData.max_possible_grade}</Text> */}
                    {/* <Text><strong>Percentage:</strong> {responseData.percentage}</Text> */}
                  </Box>

                  {responseData.results.length > 0 ? (
                    responseData.results.map((result, index) => (
                      <Box
                        key={index}
                        mb={4}
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        boxShadow="md"
                      >
                        <Text fontSize="lg" fontWeight="bold">Result {index + 1}</Text>
                        <Divider my={2} />
                        <Text><strong>Question :</strong> {result.question}</Text>
                        <Text><strong>Answer :</strong> {result.student_answer}</Text>
                        <Text><strong>Feedback :</strong> {result.feedback}</Text>
                      </Box>
                    ))
                  ) : (
                    <Text>No individual results available.</Text>
                  )}
                </>
              ) : (
                <Text>No response data available.</Text>
              )}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button colorScheme="teal" onClick={downloadPDF}>
                Download as PDF
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default PaperCorrection;
