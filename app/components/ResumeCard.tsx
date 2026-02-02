import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume,
  onDelete,
}: {
  resume: Resume;
  onDelete?: (id: string) => void;
}) => {
  const { id, companyName, jobTitle, feedback, imagePath, resumePath } = resume;
  const [resumeUrl, setResumeUrl] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { fs, kv } = usePuterStore();

  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;

      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete this resume for ${companyName || "this position"}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete KV entry
      await kv.delete(`resume:${id}`);
      
      // Delete files
      if (resumePath) await fs.delete(resumePath);
      if (imagePath) await fs.delete(imagePath);
      
      // Call parent callback to refresh list
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
      alert("Failed to delete resume. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="resume-card animate-in fade-in duration-1000 relative group">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        aria-label="Delete resume"
      >
        {isDeleting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
      
      <Link to={`/resume/${id}`} className="block">
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            {companyName && (
              <h2 className="!text-black dark:!text-white font-bold break-words">{companyName}</h2>
            )}
            {jobTitle && (
              <h3 className="text-lg break-words text-gray-500 dark:text-gray-400">{jobTitle}</h3>
            )}
            {!companyName && !jobTitle && (
              <h2 className="!text-black dark:!text-white font-bold">Resume</h2>
            )}
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>

        {resumeUrl && (
          <div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full h-full">
              <img
                src={resumeUrl}
                alt="resume"
                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default ResumeCard;
