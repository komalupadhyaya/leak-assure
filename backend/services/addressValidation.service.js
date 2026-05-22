/**
 * Google Address Validation Service
 * Used to validate and standardize U.S. addresses before signup.
 */

const validateAddress = async (address) => {
    const apiKey = process.env.GOOGLE_ADDRESS_VALIDATION_API_KEY;
    
    if (!apiKey) {
        console.warn('GOOGLE_ADDRESS_VALIDATION_API_KEY not set. Skipping validation.');
        return { 
            isValid: true, 
            components: null, 
            formattedAddress: address 
        };
    }

    try {
        const response = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: {
                    addressLines: [address],
                    regionCode: 'US'
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Google Address Validation API error:', data);
            throw new Error('Address validation failed');
        }

        const result = data.result;
        const verdict = result.verdict;

        // Extract the region code
        const regionCode = result.address.postalAddress.regionCode;

        // An address is valid if it is in the US and Google has successfully validated it to
        // at least a Route or Premise/Subpremise level (not just city/state/zip level)
        const granularity = verdict.validationGranularity;
        const isUS = regionCode === 'US';
        const isDetailedEnough = ['PREMISE', 'SUB_PREMISE', 'ROUTE', 'PREMISE_SUITE_OR_APARTMENT'].includes(granularity);

        const isValid = isUS && isDetailedEnough;

        if (!isValid) {
            return {
                isValid: false,
                error: 'Could not verify a valid, complete U.S. street address. Please check your input.'
            };
        }

        // Extract structured components
        const postalAddress = result.address.postalAddress;
        
        return {
            isValid: true,
            formattedAddress: result.address.formattedAddress,
            components: {
                street: `${postalAddress.addressLines.join(' ')}`,
                city: postalAddress.locality,
                state: postalAddress.administrativeArea,
                zip: postalAddress.postalCode,
                country: postalAddress.regionCode
            }
        };

    } catch (error) {
        console.error('Address validation error:', error);
        // If API fails, we could either reject or allow (fail-open vs fail-close)
        // Given the requirement "Accept only valid U.S. addresses", let's fail-close or handle gracefully
        return {
            isValid: false,
            error: 'Address validation service is currently unavailable. Please try again later.'
        };
    }
};

module.exports = { validateAddress };
