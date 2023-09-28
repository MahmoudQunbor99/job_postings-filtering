const postsContainer = document.getElementById("posts-container");
const createEl = (tagName, text = "", classes = []) => {
  const el = document.createElement(tagName);
  el.textContent = text;
  el.classList.add(...classes);
  return el;
};

const fetchJobs = async () => {
  try {
    const response = await fetch("./data.json");
    return await response.json();
  } catch (error) {
    console.error("Error fetching job data:", error);
    throw error;
  }
};

const createFiltersBar = () => {
  const filtersBar = createEl("div", "", ["filters-bar"]);
  postsContainer.append(filtersBar);

  const createFilterButton = (filter) => {
    const button = createEl("span", filter, ["job-filter"]);
    button.addEventListener("click", () => {
      selectedFilters.delete(filter.toLowerCase());
      createJobPostings();
    });
    return button;
  };

  const selectedFiltersButtons =
    Array.from(selectedFilters).map(createFilterButton);
  selectedFiltersButtons.forEach((filter) => filtersBar.appendChild(filter));

  const clearButton = createEl("button", "clear", ["clear-button"]);
  clearButton.addEventListener("click", () => {
    selectedFilters.clear();
    createJobPostings();
  });
  filtersBar.appendChild(clearButton);
};

const createJobPostingElement = (jobItem) => {
  const jobPostingContainer = createEl("div", "", ["job-posting"]);
  const leftSide = createEl("div", "", ["job-posting-left-side"]);
  const companyPicture = createEl("img", "", ["company-img"]);
  const jobDetails = createEl("div", "", ["job-details"]);
  const companyNameAndTags = createEl("div", "", ["company-name-and-tags"]);
  const companyName = createEl("h4", jobItem.company, ["company-name"]);
  const jobTitle = createEl("h3", jobItem.position, ["job-title"]);
  const timeAndLocation = createEl("div", "", ["time-location"]);
  const timePosted = createEl("h4", jobItem.postedAt, [
    "time-location-contents",
  ]);
  const jobType = createEl("h4", jobItem.contract, ["time-location-contents"]);
  const location = createEl("h4", jobItem.location, ["time-location-contents"]);
  const rightSide = createEl("div", "", ["job-posting-right-side"]);
  const jobFilters = createJobFilters(jobItem);

  companyNameAndTags.append(companyName);
  if (jobItem.new)
    companyNameAndTags.appendChild(createEl("h4", "new!", ["tag-new"]));
  if (jobItem.featured)
    companyNameAndTags.appendChild(
      createEl("h4", "featured", ["tag-featured"])
    );
  companyPicture.src = jobItem.logo;

  timeAndLocation.append(timePosted, jobType, location);
  jobDetails.append(companyNameAndTags, jobTitle, timeAndLocation);
  leftSide.append(companyPicture, jobDetails);
  jobPostingContainer.append(leftSide, rightSide);
  rightSide.append(jobFilters);

  return jobPostingContainer;
};

const createJobFilters = (jobItem) => {
  const jobFiltersContainer = createEl("div", "", ["job-filters"]);

  const createFilterButton = (item) => {
    const filter = createEl("span", item, ["job-filter"]);
    filter.addEventListener("click", () => {
      selectedFilters.add(filter.textContent.toLowerCase());
      createJobPostings();
    });
    return filter;
  };

  const allFilters = [
    jobItem.role,
    jobItem.level,
    ...jobItem.languages,
    ...jobItem.tools,
  ].map(createFilterButton);

  allFilters.forEach((filter) => jobFiltersContainer.appendChild(filter));

  return jobFiltersContainer;
};

const createJobPostings = async () => {
  const jobData = await fetchJobs();
  postsContainer.innerText = "";

  if (selectedFilters.size > 0) {
    createFiltersBar();

    const filteredJobs = jobData.filter((jobItem) => {
      const filterMatches = (filter) =>
        selectedFilters.has(filter.toLowerCase());
      return (
        filterMatches(jobItem.role) ||
        filterMatches(jobItem.level) ||
        jobItem.languages.some(filterMatches) ||
        jobItem.tools.some(filterMatches)
      );
    });

    if (filteredJobs.length > 0) {
      filteredJobs.forEach((jobItem) =>
        postsContainer.appendChild(createJobPostingElement(jobItem))
      );
    } else {
      const noJobsMessage = createEl(
        "p",
        "No job postings match the selected criteria.",
        ["no-jobs-message"]
      );
      postsContainer.appendChild(noJobsMessage);
    }
  } else {
    jobData.forEach((jobItem) =>
      postsContainer.appendChild(createJobPostingElement(jobItem))
    );
  }
};

const selectedFilters = new Set();
createJobPostings();
