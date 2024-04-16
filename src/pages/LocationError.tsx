export const LocationError = () => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <img src="/src/assets/Location.svg" alt="..." />
            <div className="flex flex-col items-center justify-center">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-200 mt-12">Gelocation is not enabled</p>
                <p className="md:text-lg xl:text-xl text-gray-200 mt-6">Please enable geolocation to continue.</p>
            </div>
        </div>
    )
}