import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  image: z.instanceof(File, { message: "Image is required" }),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  reporterName: z.string().min(1, "Name is required"),
  reporterEmail: z.string().email("Valid email is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function ReportForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      description: "",
      reporterName: "",
      reporterEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!data.image) {
        throw new Error("Image is required");
      }
      
      const formData = new FormData();
      formData.append("image", data.image);
      formData.append("location", data.location);
      formData.append("description", data.description || "");
      formData.append("reporterName", data.reporterName);
      formData.append("reporterEmail", data.reporterEmail);
      
      if (currentLocation) {
        formData.append("latitude", currentLocation.lat.toString());
        formData.append("longitude", currentLocation.lng.toString());
      }

      return apiRequest("POST", "/api/reports", formData);
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted Successfully!",
        description: "Thank you for reporting. We'll notify you of updates via email.",
      });
      form.reset();
      setPreviewUrl(null);
      setCurrentLocation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (file: File | undefined) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("image", file);
    } else {
      setPreviewUrl(null);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Simple reverse geocoding approximation
          form.setValue("location", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          
          toast({
            title: "Location Captured",
            description: "Your current location has been added to the report.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter it manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-8">
         <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent mb-2">
  🧹 Submit Garbage Report
</h3>
<p className="text-muted-foreground mb-6">
  Upload a photo and help us locate the issue
</p>

        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('image-input')?.click()}
                        data-testid="image-upload-area"
                      >
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg object-cover"
                          />
                        ) : (
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                              <Camera className="text-2xl text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                              <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        {...field}
                        id="image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageChange(file);
                            onChange(file);
                          }
                        }}
                        data-testid="input-image"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Section */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Location</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="text-primary hover:text-primary/80"
                      data-testid="button-current-location"
                    >
                      <MapPin className="mr-1" size={16} />
                      Use Current Location
                    </Button>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="Street Address or coordinates" 
                      {...field}
                      data-testid="input-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the garbage situation..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reporterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your name"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reporterEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="reporterPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="Enter your phone number"
                          {...field}
                          data-testid="input-contact"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            

            {/* Submit Button */}
            <Button
  type="submit"
  size="lg"
  disabled={mutation.isPending}
  className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white 
             font-semibold shadow-lg hover:scale-[1.02] transition"
>
  {mutation.isPending ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
    </>
  ) : (
    "Submit Report"
  )}
</Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
