
interface Campaign {
  id: string;
  name: string;
  description: string;
  type: string;
  email_step_1_subject_a?: string;
  email_step_1_body_a?: string;
  email_step_2_subject_a?: string;
  email_step_2_body_a?: string;
}

interface CampaignEmailData {
  email_step_1_subject_a?: string;
  email_step_1_body_a?: string;
  email_step_2_subject_a?: string;
  email_step_2_body_a?: string;
  email_step_1_subject_b?: string;
  email_step_1_body_b?: string;
  email_step_2_subject_b?: string;
  email_step_2_body_b?: string;
  ab_test_enabled?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  emailSequencesCount: number;
}

export const isCampaignComplete = (campaign: Campaign): boolean => {
  // Check required fields
  if (!campaign.name?.trim()) return false;
  if (!campaign.description?.trim()) return false;
  if (!campaign.type) return false;

  // For email campaigns, check if at least step 1 is complete
  if (campaign.type === 'email') {
    if (!campaign.email_step_1_subject_a?.trim()) return false;
    if (!campaign.email_step_1_body_a?.trim()) return false;
  }

  // For LinkedIn campaigns, we assume they're complete if basic info is filled
  // You can add more specific validation here based on your requirements

  return true;
};

export const getCompletionStatus = (campaign: Campaign): {
  isComplete: boolean;
  missingFields: string[];
} => {
  const missingFields: string[] = [];

  if (!campaign.name?.trim()) missingFields.push('Naam');
  if (!campaign.description?.trim()) missingFields.push('Beschrijving');
  if (!campaign.type) missingFields.push('Type');

  if (campaign.type === 'email') {
    if (!campaign.email_step_1_subject_a?.trim()) missingFields.push('Email stap 1 onderwerp');
    if (!campaign.email_step_1_body_a?.trim()) missingFields.push('Email stap 1 inhoud');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};

export const validateCampaignForInstantly = (campaignData: CampaignEmailData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let emailSequencesCount = 0;

  // Check if at least variant A has step 1 content
  const hasVariantAStep1 = campaignData.email_step_1_subject_a?.trim() && 
                          campaignData.email_step_1_body_a?.trim();

  if (!hasVariantAStep1) {
    errors.push("Email Sequence Variant A Step 1 is verplicht (onderwerp en inhoud)");
  } else {
    emailSequencesCount++;
  }

  // Check variant A step 2 completeness
  const hasVariantAStep2Subject = campaignData.email_step_2_subject_a?.trim();
  const hasVariantAStep2Body = campaignData.email_step_2_body_a?.trim();
  
  if (hasVariantAStep2Subject && !hasVariantAStep2Body) {
    warnings.push("Variant A Step 2 heeft een onderwerp maar geen inhoud");
  } else if (!hasVariantAStep2Subject && hasVariantAStep2Body) {
    warnings.push("Variant A Step 2 heeft inhoud maar geen onderwerp");
  }

  // If A/B testing is enabled, validate variant B
  if (campaignData.ab_test_enabled) {
    const hasVariantBStep1 = campaignData.email_step_1_subject_b?.trim() && 
                            campaignData.email_step_1_body_b?.trim();

    if (!hasVariantBStep1) {
      errors.push("A/B testing is ingeschakeld maar Variant B Step 1 ontbreekt");
    } else {
      emailSequencesCount++;
    }

    // Check variant B step 2 completeness
    const hasVariantBStep2Subject = campaignData.email_step_2_subject_b?.trim();
    const hasVariantBStep2Body = campaignData.email_step_2_body_b?.trim();
    
    if (hasVariantBStep2Subject && !hasVariantBStep2Body) {
      warnings.push("Variant B Step 2 heeft een onderwerp maar geen inhoud");
    } else if (!hasVariantBStep2Subject && hasVariantBStep2Body) {
      warnings.push("Variant B Step 2 heeft inhoud maar geen onderwerp");
    }
  }

  // Check for email personalization variables
  const allEmailBodies = [
    campaignData.email_step_1_body_a,
    campaignData.email_step_2_body_a,
    campaignData.email_step_1_body_b,
    campaignData.email_step_2_body_b
  ].filter(body => body?.trim());

  const hasPersonalization = allEmailBodies.some(body => 
    body?.includes('{{first_name}}') || 
    body?.includes('{{company_name}}') ||
    body?.includes('{{last_name}}') ||
    body?.includes('{{title}}')
  );

  if (!hasPersonalization && allEmailBodies.length > 0) {
    warnings.push("Geen personalisatie variabelen gevonden ({{first_name}}, {{company_name}}, etc.)");
  }

  // Check email length recommendations
  allEmailBodies.forEach((body, index) => {
    if (body && body.length > 1000) {
      warnings.push(`Email ${index + 1} is mogelijk te lang (${body.length} karakters). Houd het onder de 500 karakters voor betere respons.`);
    }
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    emailSequencesCount
  };
};

export const getEmailSequencePreview = (campaignData: CampaignEmailData) => {
  const sequences = [];

  // Variant A
  if (campaignData.email_step_1_subject_a && campaignData.email_step_1_body_a) {
    const variantA = {
      variant: 'A',
      steps: [
        {
          step: 1,
          subject: campaignData.email_step_1_subject_a,
          bodyPreview: campaignData.email_step_1_body_a.substring(0, 100) + '...',
          delay: 0
        }
      ]
    };

    if (campaignData.email_step_2_subject_a && campaignData.email_step_2_body_a) {
      variantA.steps.push({
        step: 2,
        subject: campaignData.email_step_2_subject_a,
        bodyPreview: campaignData.email_step_2_body_a.substring(0, 100) + '...',
        delay: 2 // days
      });
    }

    sequences.push(variantA);
  }

  // Variant B (if A/B testing enabled)
  if (campaignData.ab_test_enabled && 
      campaignData.email_step_1_subject_b && 
      campaignData.email_step_1_body_b) {
    
    const variantB = {
      variant: 'B',
      steps: [
        {
          step: 1,
          subject: campaignData.email_step_1_subject_b,
          bodyPreview: campaignData.email_step_1_body_b.substring(0, 100) + '...',
          delay: 0
        }
      ]
    };

    if (campaignData.email_step_2_subject_b && campaignData.email_step_2_body_b) {
      variantB.steps.push({
        step: 2,
        subject: campaignData.email_step_2_subject_b,
        bodyPreview: campaignData.email_step_2_body_b.substring(0, 100) + '...',
        delay: 2 // days
      });
    }

    sequences.push(variantB);
  }

  return sequences;
};

export const generateDefaultEmailTemplate = (campaignName: string, description?: string) => {
  return {
    email_step_1_subject_a: `Quick question about ${campaignName}`,
    email_step_1_body_a: `Hi {{first_name}},

I hope this email finds you well.

I noticed that {{company_name}} ${description ? `is ${description.toLowerCase()}` : 'might benefit from our services'}.

I'd love to share how we've helped similar companies achieve their goals.

Would you be open to a brief conversation this week?

Best regards,
{{sender_name}}`,
    email_step_2_subject_a: `Re: Quick question about ${campaignName}`,
    email_step_2_body_a: `Hi {{first_name}},

I wanted to follow up on my previous email about ${campaignName}.

I understand you're probably busy, but I believe there's potential value in connecting.

If you're interested, I can share some concrete examples of results we've achieved for companies like {{company_name}}.

Would a 15-minute call work for you?

Best regards,
{{sender_name}}`
  };
};
