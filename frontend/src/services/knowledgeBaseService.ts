import { IncidentCategory, VerifiedSolution } from '../types';
import { mockVerifiedSolutions } from './mockData/mockKnowledgeBase';
import { apiClient } from './apiClient';

const STORAGE_KEY_KB = 'intellidesk_kb_store';

const getStoredSolutions = (): VerifiedSolution[] => {
  const raw = localStorage.getItem(STORAGE_KEY_KB);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_KB, JSON.stringify(mockVerifiedSolutions));
  return [...mockVerifiedSolutions];
};

const saveStoredSolutions = (list: VerifiedSolution[]): void => {
  localStorage.setItem(STORAGE_KEY_KB, JSON.stringify(list));
};

export const knowledgeBaseService = {
  async getSolutions(category?: IncidentCategory | 'All', searchQuery?: string): Promise<VerifiedSolution[]> {
    return apiClient.get<VerifiedSolution[]>(
      '/knowledge-base/solutions',
      () => {
        let list = getStoredSolutions();

        if (category && category !== 'All') {
          list = list.filter(s => s.category === category);
        }

        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter(
            s =>
              s.title.toLowerCase().includes(q) ||
              s.rootCause.toLowerCase().includes(q) ||
              s.tags.some(t => t.toLowerCase().includes(q)) ||
              s.targetSystems.some(sys => sys.toLowerCase().includes(q)) ||
              s.solutionSteps.some(step => step.toLowerCase().includes(q))
          );
        }

        return list;
      }
    );
  },

  async getSolutionById(id: string): Promise<VerifiedSolution> {
    return apiClient.get<VerifiedSolution>(
      `/knowledge-base/solutions/${id}`,
      () => {
        const list = getStoredSolutions();
        const found = list.find(s => s.id === id);
        if (!found) {
          throw new Error(`Solution with ID ${id} not found`);
        }
        return found;
      }
    );
  },

  async voteSolution(id: string): Promise<VerifiedSolution> {
    return apiClient.post<VerifiedSolution>(
      `/knowledge-base/solutions/${id}/vote`,
      {},
      () => {
        const list = getStoredSolutions();
        const index = list.findIndex(s => s.id === id);
        if (index === -1) throw new Error(`Solution not found`);

        const item = list[index];
        const hasVoted = !!item.userVoted;
        const updated = {
          ...item,
          userVoted: !hasVoted,
          helpfulVotes: hasVoted ? item.helpfulVotes - 1 : item.helpfulVotes + 1,
        };

        list[index] = updated;
        saveStoredSolutions(list);
        return updated;
      }
    );
  },
};
