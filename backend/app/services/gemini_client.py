"""Gemini API client wrapper with async support and rate limiting."""

import asyncio
import json
from typing import Optional, Any
from pathlib import Path

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.config import settings


class GeminiClient:
    """Async wrapper for Gemini API with rate limiting and retry logic."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        max_concurrent: Optional[int] = None,
    ):
        """Initialize the Gemini client.

        Args:
            api_key: Gemini API key (defaults to settings.GEMINI_API_KEY)
            model_name: Model to use (defaults to settings.GEMINI_MODEL)
            max_concurrent: Max concurrent API calls (defaults to settings.GEMINI_MAX_CONCURRENT)
        """
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self.max_concurrent = max_concurrent or settings.GEMINI_MAX_CONCURRENT

        # Configure Gemini
        genai.configure(api_key=self.api_key)

        # Create model instance
        self.model = genai.GenerativeModel(self.model_name)

        # Semaphore for rate limiting
        self.semaphore = asyncio.Semaphore(self.max_concurrent)

    async def generate_async(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_retries: int = None,
        json_mode: bool = True,
        model: Optional[str] = None,
        max_output_tokens: Optional[int] = None,
    ) -> str:
        """Generate content asynchronously with retry logic.

        Args:
            prompt: The prompt to send to Gemini
            temperature: Generation temperature (0.0-1.0)
            max_retries: Max retry attempts (defaults to settings.GEMINI_MAX_RETRIES)
            json_mode: Whether to request JSON output
            model: Model to use (defaults to self.model_name)
            max_output_tokens: Maximum tokens in response (None = model default)

        Returns:
            Generated text response

        Raises:
            Exception: If all retries fail
        """
        if max_retries is None:
            max_retries = settings.GEMINI_MAX_RETRIES

        # Use specified model or default
        model_to_use = genai.GenerativeModel(model) if model else self.model

        async with self.semaphore:
            for attempt in range(max_retries):
                try:
                    # Run the synchronous generate_content in a thread pool
                    loop = asyncio.get_event_loop()

                    config_params = {
                        "temperature": temperature,
                        "response_mime_type": "application/json" if json_mode else "text/plain",
                    }

                    if max_output_tokens is not None:
                        config_params["max_output_tokens"] = max_output_tokens

                    generation_config = GenerationConfig(**config_params)

                    response = await loop.run_in_executor(
                        None,
                        lambda: model_to_use.generate_content(
                            prompt, generation_config=generation_config
                        ),
                    )

                    return response.text

                except Exception as e:
                    if attempt == max_retries - 1:
                        # Last attempt failed
                        raise Exception(
                            f"Gemini API call failed after {max_retries} attempts: {e}"
                        )

                    # Wait before retrying (exponential backoff)
                    wait_time = 2**attempt
                    await asyncio.sleep(wait_time)

    async def generate_with_video(
        self,
        video_url: str,
        prompt: str,
        temperature: float = 0.7,
        max_retries: int = None,
        model: Optional[str] = None,
    ) -> str:
        """Generate content with video input.

        Args:
            video_url: URL or path to video file
            prompt: The prompt to send with the video
            temperature: Generation temperature
            max_retries: Max retry attempts
            model: Model to use (defaults to self.model_name)

        Returns:
            Generated text response
        """
        if max_retries is None:
            max_retries = settings.GEMINI_MAX_RETRIES

        # Use specified model or default
        model_to_use = genai.GenerativeModel(model) if model else self.model

        async with self.semaphore:
            for attempt in range(max_retries):
                try:
                    loop = asyncio.get_event_loop()

                    # Check if video_url is a remote URL (http/https) or local file path
                    if video_url.startswith('http://') or video_url.startswith('https://'):
                        # For remote URLs (like Cloudflare R2), download the file first
                        import tempfile
                        import aiohttp
                        import mimetypes
                        import os

                        print(f"[GeminiClient] Downloading video from R2: {video_url}")

                        # Download video to temporary file
                        async with aiohttp.ClientSession() as session:
                            async with session.get(video_url, timeout=aiohttp.ClientTimeout(total=60)) as response:
                                response.raise_for_status()

                                # Create temporary file with appropriate extension
                                content_type = response.headers.get('content-type', 'video/mp4')
                                extension = mimetypes.guess_extension(content_type) or '.mp4'

                                with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp_file:
                                    content = await response.read()
                                    tmp_file.write(content)
                                    file_path = tmp_file.name

                        print(f"[GeminiClient] Video downloaded to temporary file: {file_path}")

                        # Upload to Gemini
                        video_file = await loop.run_in_executor(
                            None, lambda: genai.upload_file(file_path)
                        )

                        # Clean up temporary file after upload
                        try:
                            os.unlink(file_path)
                        except:
                            pass
                    else:
                        # Handle local file paths
                        file_path = video_url
                        if video_url.startswith('/videos/'):
                            # Convert /videos/filename.ext to videos/filename.ext
                            file_path = video_url[1:]  # Remove leading slash
                        elif video_url.startswith('/api/v1/videos/'):
                            # Convert /api/v1/videos/filename.ext to videos/filename.ext
                            file_path = video_url.replace('/api/v1/videos/', 'videos/')

                        # Upload video file
                        video_file = await loop.run_in_executor(
                            None, lambda: genai.upload_file(file_path)
                        )

                    # Wait for video processing
                    while video_file.state.name == "PROCESSING":
                        await asyncio.sleep(2)
                        video_file = await loop.run_in_executor(
                            None, lambda: genai.get_file(video_file.name)
                        )

                    if video_file.state.name == "FAILED":
                        raise Exception("Video processing failed")

                    generation_config = GenerationConfig(
                        temperature=temperature,
                        response_mime_type="application/json",
                    )

                    # Generate content with video
                    response = await loop.run_in_executor(
                        None,
                        lambda: model_to_use.generate_content(
                            [video_file, prompt], generation_config=generation_config
                        ),
                    )

                    return response.text

                except Exception as e:
                    if attempt == max_retries - 1:
                        raise Exception(
                            f"Gemini video API call failed after {max_retries} attempts: {e}"
                        )

                    wait_time = 2**attempt
                    await asyncio.sleep(wait_time)

    def load_prompt_template(self, template_path: Path) -> str:
        """Load an XML prompt template from file.

        Args:
            template_path: Path to the XML template file

        Returns:
            Template content as string
        """
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()

    def format_prompt(self, template: str, **kwargs) -> str:
        """Format a prompt template with variables.

        Args:
            template: The template string
            **kwargs: Variables to inject into template

        Returns:
            Formatted prompt
        """
        return template.format(**kwargs)

    async def generate_batch(
        self,
        prompts: list[str],
        temperature: float = 0.7,
        max_retries: int = None,
    ) -> list[str]:
        """Generate content for multiple prompts in parallel.

        Args:
            prompts: List of prompts to process
            temperature: Generation temperature
            max_retries: Max retry attempts per prompt

        Returns:
            List of generated responses (same order as prompts)
        """
        tasks = [
            self.generate_async(prompt, temperature, max_retries) for prompt in prompts
        ]

        return await asyncio.gather(*tasks)


# Global instance
gemini_client = GeminiClient()
