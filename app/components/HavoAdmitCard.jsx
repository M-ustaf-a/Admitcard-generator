"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const HavoAdmitCard = () => {
  const [formData, setFormData] = useState({
    applicant: '',
    name: '',
    fatherName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const AdmitCard = () => (
    <div className=" p-4 rounded-lg w-[800px] mx-auto" id="admitCard">
      <div className=" p-6" style={{
          backgroundImage: `url('bg.jpg')`, // Replace with actual HAVO logo
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100%',
        }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-40 h-40 flex-shrink-0">
            <img src="logo.jpg" alt="HAVO Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2">HINDUSTAN AWAAM VOICE & ORGANIZATION (HAVO)</h1>
            <div className="bg-green-700 text-white rounded-lg text-xl font-sans mt-5 pl-4 pb-5">
              HAVO Matric Scholarship Test 2025 (DIGITAL ADMIT CARD)
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mt-8">
          <div className='ml-24'>
          <div className="text-lg">
            <span className="font-semibold">Applicant Code: </span>
            <span>{formData.applicant || '_________________'}</span>
          </div>
          <div className="text-lg">
            <span className="font-semibold">Name: </span>
            <span>{formData.name || '_________________'}</span>
          </div>
          
          <div className="text-lg">
            <span className="font-semibold">Father's Name: </span>
            <span>{formData.fatherName || '_________________'}</span>
          </div>
          </div>
          
          <div className='mt-16'>
          <div className="text-lg">
            <span className="font-semibold">Test Date: </span>
            <span>12 January 2025 (SUNDAY)</span>
          </div>
          
          <div className="text-lg">
            <span className="font-semibold">Time: </span>
            <span>12:00 PM TO 02:00 PM</span>
          </div>
          <div className="text-lg">
            <span className="font-semibold">Test Centre: </span>
            <span>Online</span>
          </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="mt-8">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-lg">In case of any related queries, please contact the <span className='text-lime-600'>Helpdesk</span>!</p>
              <p className="text-xl font-bold flex"><img src="whatsapp.svg" alt="" className='h-8 w-8'/>0829-407-9985</p>
            </div>
            <div className="text-right">
              <div className="w-32 h-32">
                <img src="qr-code.svg" alt="QR Code" className="w-full h-full object-contain ml-6" />
              </div>
              <p className="text-lg font-semibold mt-2">Authorised Signature</p>
              <p>Digital Approved (V-REF)</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg">Follow us on- @HAVOindia www.havoindia.org</p>
          </div>
        </div>
      </div>
    </div>
  );

  const captureAndDownload = async (format) => {
    const admitCard = document.getElementById('admitCard');
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(admitCard, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      if (format === 'image') {
        // Download as PNG
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `HAVO-admit-card-${formData.name}.png`;
        link.click();
      } else if (format === 'pdf') {
        // Download as PDF
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`HAVO-admit-card-${formData.name}.pdf`);
      }
    } catch (error) {
      console.error('Error generating admit card:', error);
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
              <Label htmlFor='applicant'>Applicant code</Label>
              <Input id='applicant' name='applicant' value={formData.applicant} onChange={handleInputChange} placeholder='Enter the applicant code'></Input>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="fatherName">Father's Name</Label>
              <Input
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                placeholder="Enter father's name"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => captureAndDownload('pdf')} className="flex items-center gap-2">
                <Download size={16} />
                Download PDF
              </Button>
              <Button onClick={() => captureAndDownload('image')} className="flex items-center gap-2">
                <Download size={16} />
                Download Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <AdmitCard />
      </div>
    </div>
  );
};

export default HavoAdmitCard;