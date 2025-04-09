import arviz as az

try:
    model = az.from_netcdf("mmm_model_trace.nc")
    print("✅ Model loaded successfully")
    
    # Print available variables
    print("📌 Posterior Variables:", model.posterior)
    print("📌 Dimensions:", model.posterior.dims)

except Exception as e:
    print(f"❌ Error loading model: {e}")
