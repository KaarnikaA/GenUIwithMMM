// import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
// import InfoIcon from '@mui/icons-material/Info';

// export default function ModelInfo({ data }) {
//   if (!data) return null;
  
//   return (
//     <Paper sx={{ p: 2, mb: 2 }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//         <InfoIcon color="primary" sx={{ mr: 1 }} />
//         <Typography variant="h6">Model Information</Typography>
//       </Box>
      
//       <Grid container spacing={2}>
//         <Grid item xs={12} md={6}>
//           <Typography variant="subtitle1">Basic Info</Typography>
//           <Divider sx={{ my: 1 }} />
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
//             <Chip label={`Type: ${data.type || 'N/A'}`} />
//             <Chip label={`Framework: ${data.framework || 'N/A'}`} />
//             <Chip label={`Samples: ${data.posterior_samples || 'N/A'}`} />
//             <Chip label={`Chains: ${data.chains || 'N/A'}`} />
//           </Box>
          
//           {data.marketing_contribution && (
//             <>
//               <Typography variant="subtitle1">Marketing Contribution</Typography>
//               <Divider sx={{ my: 1 }} />
//               <Typography>
//                 Total: ${data.marketing_contribution.value?.toFixed(2) || 'N/A'}
//               </Typography>
//               <Typography>
//                 Percentage: {data.marketing_contribution.percentage?.toFixed(2) || 'N/A'}% of sales
//               </Typography>
//             </>
//           )}
//         </Grid>
        
//         <Grid item xs={12} md={6}>
//           <Typography variant="subtitle1">Channels</Typography>
//           <Divider sx={{ my: 1 }} />
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//             {data.channels?.map((channel, i) => (
//               <Chip key={i} label={channel} color="secondary" />
//             ))}
//           </Box>
          
//           <Typography variant="subtitle1" sx={{ mt: 2 }}>Model Variables</Typography>
//           <Divider sx={{ my: 1 }} />
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//             {data.variables?.slice(0, 10).map((varName, i) => (
//               <Chip key={i} label={varName} size="small" />
//             ))}
//             {data.variables?.length > 10 && (
//               <Chip label={`+${data.variables.length - 10} more`} size="small" />
//             )}
//           </Box>
//         </Grid>
//       </Grid>
//     </Paper>
//   );
// }
import { Box, Typography, Paper, Divider, Chip, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function ModelInfo({ data }) {
  if (!data) return null;
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InfoIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Model Information</Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Basic Info</Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label={`Type: ${data.type || 'N/A'}`} />
            <Chip label={`Framework: ${data.framework || 'N/A'}`} />
            <Chip label={`Samples: ${data.posterior_samples || 'N/A'}`} />
            <Chip label={`Chains: ${data.chains || 'N/A'}`} />
          </Box>
          
          {data.marketing_contribution && (
            <>
              <Typography variant="subtitle1">Marketing Contribution</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                Total: {data.marketing_contribution.value ? `$${data.marketing_contribution.value.toFixed(2)}` : 'N/A'}
              </Typography>
              <Typography>
                Percentage: {data.marketing_contribution.percentage ? `${data.marketing_contribution.percentage.toFixed(2)}%` : 'N/A'} of sales
              </Typography>
            </>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Channels</Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {data.channels?.length > 0 ? (
              data.channels.map((channel, i) => (
                <Chip key={i} label={channel} color="secondary" />
              ))
            ) : (
              <Chip label="No channels available" />
            )}
          </Box>
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Model Variables</Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {data.variables?.length > 0 ? (
              <>
                {data.variables.slice(0, 10).map((varName, i) => (
                  <Chip key={i} label={varName} size="small" />
                ))}
                {data.variables.length > 10 && (
                  <Chip label={`+${data.variables.length - 10} more`} size="small" />
                )}
              </>
            ) : (
              <Chip label="No variables available" size="small" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}