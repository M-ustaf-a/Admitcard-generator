"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Send } from 'lucide-react';
import * as XLSX from 'xlsx';

// Define AdmitCard component separately
const AdmitCard = ({ formData }) => (
  <div className="p-4 rounded-lg w-[750px] mx-auto" id="admitCard">
    <div className="p-6" style={{
        backgroundImage: `url('bg.jpg')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '750px',
      }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-40 h-[960px] flex-shrink-0">
          {/* <img src="logo.jpg" alt="HAVO Logo" className="w-full h-full object-contain" /> */}
        </div>
        <div className="flex-1">
          {/* <h1 className="text-xl font-bold mb-2">HINDUSTAN AWAAM VOICE & ORGANIZATION (HAVO)</h1> */}
          {/* <div className="bg-green-700 text-white rounded-lg text-xl font-sans mt-5 pl-4 pb-5">
            HAVO Matric Scholarship Test 2025 (DIGITAL ADMIT CARD)
          </div> */}
      <div className="mb-[260px]">
        <div className='ml-[14px] mt-5'>
          <div className='text-lg'>
            <span className='font-bold'>{formData.applicant || '_________________'}</span>
          </div>
          <div className="text-lg">
            <span className='font-bold'>{formData.name || '_________________'}</span>
          </div>
          <div className=" text-lg">
            <span className='font-bold'>{formData.fatherName || '_________________'}</span>
          </div>
        </div>
        <div className='mt-16'>
          <div className="text-lg">
            {/* <span className="font-semibold">Test Date: </span>
            <span>12 January 2025 (SUNDAY)</span> */}
          </div>
          <div className="text-lg">
            {/* <span className="font-semibold">Time: </span>
            <span>12:00 PM TO 02:00 PM</span> */}
          </div>
          <div className="text-lg">
            {/* <span className="font-semibold">Test Centre: </span>
            <span>Online</span> */}
          </div>
        </div>
      </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-end">
          <div>
            {/* <p className="text-lg">In case of any related queries, please contact the <span className='text-lime-600'>Helpdesk</span>!</p>
            <p className="text-xl font-bold flex"><img src="whatsapp.svg" alt="" className='h-8 w-8'/>0829-407-9985</p> */}
          </div>
          <div className="text-right">
            <div className="w-32 h-32">
              {/* <img src="qr-code.svg" alt="QR Code" className="w-full h-full object-contain ml-6" /> */}
            </div>
            {/* <p className="text-lg font-semibold mt-2">Authorised Signature</p>
            <p>Digital Approved (V-REF)</p> */}
          </div>
        </div>
        <div className="mt-8 text-center">
          {/* <p className="text-lg">Follow us on- @HAVOindia www.havoindia.org</p> */}
        </div>
      </div>
    </div>
  </div>
);

const HavoAdmitCard = () => {
  const [formData, setFormData] = useState({
    applicant: '',
    name: '',
    fatherName: '',
    whatsappNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [downloadedNamesSet, setDownloadedNamesSet] = useState(new Set());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const formatWhatsAppNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  };

  const validateWhatsAppNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 12;
  };

  const saveSpreadsheet = (names) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Date', 'Name', 'WhatsApp Number', 'Status'],
      ...Array.from(names).map(name => [
        new Date().toLocaleDateString(),
        name,
        formData.whatsappNumber,
        'Sent'
      ])
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Downloaded Names');
    XLSX.writeFile(workbook, 'admit-cards-record.xlsx');
  };

  const sendToWhatsApp = async (imageUrl) => {
    if (!validateWhatsAppNumber(formData.whatsappNumber)) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return false;
    }

    const formattedNumber = formatWhatsAppNumber(formData.whatsappNumber);

    try {
      setIsLoading(true);
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedNumber,
          image: imageUrl,
          message: `Dear ${formData.name},\n\nHere is your HAVO Matric Scholarship Test 2025 Admit Card.\n\nTest Details:\nDate: 12 January 2025 (SUNDAY)\nTime: 12:00 PM TO 02:00 PM\nVenue: Online\n\nFor any queries, contact helpdesk: 0829-407-9985\n\nBest regards,\nHAVO Team`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      toast({
        title: "Success!",
        description: "Admit card sent successfully on WhatsApp",
      });
      return true;

    } catch (error) {
      console.error('WhatsApp sending error:', error);
      toast({
        title: "Error",
        description: "Failed to send admit card on WhatsApp. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const captureAndDownload = async (format, shouldSendWhatsApp = false) => {
    const admitCard = document.getElementById('admitCard');

    if (!formData.name || !formData.applicant || !formData.fatherName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (shouldSendWhatsApp && !formData.whatsappNumber) {
      toast({
        title: "Missing WhatsApp Number",
        description: "Please enter a WhatsApp number to send the admit card",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(admitCard, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL('image/png');

      if (shouldSendWhatsApp) {
        const sent = await sendToWhatsApp(image);
        if (sent && formData.name) {
          setDownloadedNamesSet(prevSet => {
            const newSet = new Set(prevSet);
            newSet.add(formData.name);
            saveSpreadsheet(newSet);
            return newSet;
          });
        }
      } else {
        if (format === 'image') {
          const link = document.createElement('a');
          link.href = image;
          link.download = `${formData.applicant}.png`;
          link.click();
        } else if (format === 'pdf') {
          const { jsPDF } = await import('jspdf');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(image);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(image, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${formData.applicant}.pdf`);
        }

        if (formData.name) {
          setDownloadedNamesSet(prevSet => {
            const newSet = new Set(prevSet);
            newSet.add(formData.name);
            saveSpreadsheet(newSet);
            return newSet;
          });
        }

        toast({
          title: "Success!",
          description: `Admit card ${format === 'pdf' ? 'PDF' : 'image'} downloaded successfully`,
        });
      }
    } catch (error) {
      console.error('Error generating admit card:', error);
      toast({
        title: "Error",
        description: "Failed to generate admit card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>HAVO Admit Card Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor='applicant'>Applicant code *</Label>
              <Input 
                id='applicant' 
                name='applicant' 
                value={formData.applicant} 
                onChange={handleInputChange} 
                placeholder='Enter the applicant code'
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                placeholder="Enter father's name"
                required
              />
            </div>
            <div>
              <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                placeholder="Enter WhatsApp number"
                type="tel"
                required
              />
            </div>
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={() => captureAndDownload('pdf')} 
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Download size={16} />
                Download PDF
              </Button>
              <Button 
                onClick={() => captureAndDownload('image')} 
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Download size={16} />
                Download Image
              </Button>
              <Button 
                onClick={() => captureAndDownload('image', true)} 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Send size={16} />
                {isLoading ? 'Sending...' : 'Send on WhatsApp'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
        <AdmitCard formData={formData} />
      </div>
    </div>
  );
};

export default HavoAdmitCard;