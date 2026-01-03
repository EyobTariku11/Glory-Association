FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Add build argument to force rebuild
ARG BUILD_DATE
ARG BUILD_VERSION
ARG BUILD_TIMESTAMP

# Copy the solution file first for better layer caching
COPY Coalition_Membership_API.sln .

# Copy project files
COPY MembershipAPI/*.csproj ./MembershipAPI/
COPY MembershipImplementation/*.csproj ./MembershipImplementation/
COPY MembershipInfrustructure/*.csproj ./MembershipInfrustructure/

# Restore all projects with explicit restore and force download
RUN dotnet restore "Coalition_Membership_API.sln" --verbosity normal --force

# Copy the rest of the source code
COPY . .

# Force restore again after copying source to ensure all dependencies are available
RUN dotnet restore "Coalition_Membership_API.sln" --verbosity normal --force

# Build the solution (simplified approach)
RUN dotnet build "Coalition_Membership_API.sln" -c Release --no-restore

FROM build AS publish
# Publish the API project with all dependencies
RUN dotnet publish "MembershipAPI/MembershipAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false --no-build

FROM base AS final
WORKDIR /app

# Add build metadata
ARG BUILD_DATE
ARG BUILD_VERSION
ARG BUILD_TIMESTAMP

# Set environment variables for build info
ENV BUILD_DATE=${BUILD_DATE}
ENV BUILD_VERSION=${BUILD_VERSION}
ENV BUILD_TIMESTAMP=${BUILD_TIMESTAMP}

# Copy the published application
COPY --from=publish /app/publish .

# Create wwwroot directory for persistent storage
RUN mkdir -p /var/wwwroot

# Create symbolic link to /var/wwwroot
RUN ln -sf /var/wwwroot /app/wwwroot

# Set proper permissions
RUN chmod -R 755 /app

ENTRYPOINT ["dotnet", "MembershipAPI.dll"] 